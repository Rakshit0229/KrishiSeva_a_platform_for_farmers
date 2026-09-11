import cron from 'node-cron';
import { memoryStore } from '../db';

export function initializeCronJobs() {
  console.log('⏰ Initializing background cron jobs...');

  // 2:00 AM IST daily — demand forecast generation
  cron.schedule('30 20 * * *', () => {
    console.log('[CRON] Running daily demand forecast update...');
  });

  // 11:30 PM IST daily — officer metrics
  cron.schedule('0 18 * * *', () => {
    console.log('[CRON] Computing officer daily throughput metrics...');
  });

  // Every 5 min — health snapshot + waitlist processing
  cron.schedule('*/5 * * * *', async () => {
    // Process any available waitlists if slot capacity opened
    processWaitlists();
  });

  // Every 6 hours — weather cache refresh
  cron.schedule('0 */6 * * *', () => {
    console.log('[CRON] Refreshing district weather forecast cache...');
  });

  // Hourly — clean expired announcements
  cron.schedule('0 * * * *', () => {
    const now = new Date();
    memoryStore.announcements = memoryStore.announcements.filter(a => !a.expires_at || new Date(a.expires_at) > now);
  });
}

function processWaitlists() {
  for (const item of memoryStore.slot_waitlist) {
    if (!item.notified) {
      const slot = memoryStore.slots.find(s => s.id === item.slot_id);
      if (slot && slot.booked_count < slot.max_capacity) {
        item.notified = true;
        memoryStore.in_app_notifications.push({
          id: `notif-${Date.now()}`,
          user_id: item.farmer_id,
          title: 'Slot Available Alert 🌾',
          body: `A slot on ${slot.slot_date} (${slot.start_time}) is now available!`,
          type: 'slot_available',
          is_read: false,
          action_url: `/farmer/book-slot?centreId=${slot.centre_id}`,
          created_at: new Date().toISOString(),
        });
      }
    }
  }
}
