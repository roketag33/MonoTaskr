import { Session } from './types';

export class ExportService {
  /**
   * Convert data to JSON string
   * @param data Any data to export
   * @returns JSON string
   */
  static generateJSON(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Convert sessions to CSV string
   * @param sessions List of sessions
   * @returns CSV string
   */
  static generateCSV(sessions: Session[]): string {
    const headers = ['Date', 'Duration (min)', 'Completed', 'ID'];
    const rows = sessions.map((session) => {
      const date = new Date(session.timestamp).toLocaleDateString();
      const duration = Math.round(session.duration / 60);
      const completed = session.completed ? 'Yes' : 'No';
      return [date, duration, completed, session.id].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Trigger file download in browser
   * @param content Content of the file
   * @param filename Name of the file
   * @param contentType MIME type
   */
  static downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
