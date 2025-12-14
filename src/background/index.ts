import { TimerService } from './timer.service';
import { AccessService } from './access.service';
import { MESSAGES, MessagePayload } from '../shared/messaging';

console.log('MonoTaskr background service worker loaded.');

const timerService = new TimerService();

// Message Handling
chrome.runtime.onMessage.addListener((message: MessagePayload, _sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case MESSAGES.START_TIMER:
        await timerService.start(message.payload.duration, message.payload.intervalConfig);
        break;
      case MESSAGES.RESET_TIMER:
        await timerService.stop();
        break;
      case MESSAGES.PAUSE_TIMER:
        await timerService.pause();
        break;
      case MESSAGES.GET_STATUS:
        // Implemented if needed
        break;
      case MESSAGES.REQUEST_TEMP_ACCESS: {
        const result = await AccessService.requestTempAccess(message.payload.domain);
        sendResponse(result);
        return; // Early return as we sent response manually with data
      }
    }
    sendResponse({ success: true });
  })();
  return true; // Keep channel open for async response
});

// Alarm Handling
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'monotaskr_timer_tick') {
    timerService.handleAlarm(alarm);
  } else if (alarm.name === 'monotaskr_schedule_check') {
    timerService.checkSchedule();
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('MonoTaskr installed.');
  // Check schedule every minute
  chrome.alarms.create('monotaskr_schedule_check', { periodInMinutes: 1 });
});
