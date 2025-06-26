import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { searchParams } = new URL(request.url);
  
  const days = parseInt(searchParams.get('days') || '7');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('user_id', session.user.id)
      .single();

    if (!profile || profile.role !== 'trainer') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Buscar configurações do tenant
    const { data: webhookConfigs } = await supabase
      .from('webhook_configurations')
      .select('id, name')
      .eq('tenant_id', profile.tenant_id);

    if (!webhookConfigs || webhookConfigs.length === 0) {
      return NextResponse.json({
        totalSent: 0,
        successRate: 0,
        eventBreakdown: {},
        dailyStats: [],
        webhookPerformance: []
      });
    }

    const webhookIds = webhookConfigs.map((w: { id: any; }) => w.id);

    // Estatísticas gerais
    const { data: totalLogs } = await supabase
      .from('webhook_logs')
      .select('success, event_type, sent_at')
      .in('webhook_config_id', webhookIds)
      .gte('sent_at', startDate.toISOString());

    if (!totalLogs) {
      return NextResponse.json({
        totalSent: 0,
        successRate: 0,
        eventBreakdown: {},
        dailyStats: [],
        webhookPerformance: []
      });
    }

    const totalSent = totalLogs.length;
    const successCount = totalLogs.filter((log: { success: any; }) => log.success).length;
    const successRate = totalSent > 0 ? (successCount / totalSent) * 100 : 0;

    // Breakdown por evento
    const eventBreakdown = totalLogs.reduce((acc: any, log: { event_type: string | number; success: any; }) => {
      if (!acc[log.event_type]) {
        acc[log.event_type] = { total: 0, success: 0 };
      }
      acc[log.event_type].total++;
      if (log.success) acc[log.event_type].success++;
      return acc;
    }, {});

    // Estatísticas diárias
    const dailyStats = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLogs = totalLogs.filter((log: { sent_at: string; }) => 
        log.sent_at.startsWith(dateStr)
      );
      
      dailyStats.unshift({
        date: dateStr,
        total: dayLogs.length,
        success: dayLogs.filter((log: { success: any; }) => log.success).length,
        failed: dayLogs.filter((log: { success: any; }) => !log.success).length
      });
    }

    // Performance por webhook
    const webhookPerformance = await Promise.all(
      webhookConfigs.map(async (config: { id: any; name: any; }) => {
        const { data: logs } = await supabase
          .from('webhook_logs')
          .select('success')
          .eq('webhook_config_id', config.id)
          .gte('sent_at', startDate.toISOString());

        const configTotal = logs?.length || 0;
        const configSuccess = logs?.filter((log: { success: any; }) => log.success).length || 0;
        
        return {
          id: config.id,
          name: config.name,
          total: configTotal,
          success: configSuccess,
          successRate: configTotal > 0 ? (configSuccess / configTotal) * 100 : 0
        };
      })
    );

    return NextResponse.json({
      totalSent,
      successRate: Math.round(successRate * 100) / 100,
      eventBreakdown,
      dailyStats,
      webhookPerformance
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}