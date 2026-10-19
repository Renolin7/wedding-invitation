import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  message: string;
}

interface CalendarDay {
  day: number;
  isWeddingDay: boolean;
  isEmpty: boolean;
}

@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  protected readonly wedding = {
    groom: 'Renolin R',
    bride: 'Evanchelin P',
    date: 'Monday, 18 January 2027',
    dateShort: '18.01.2027',
    dateIso: '2027-01-18',
    time: '10:00 AM',
    timezone: 'Indian Standard Time (IST)',
    venue: 'CSI Church Punniyadi',
    address: 'CSI Church Rd, Punnaiyadi, South Thamarai Kulam, Thenthamaraikulam, Tamil Nadu 629701',
    mapUrl: 'https://maps.app.goo.gl/RM28ov4j3gz2ck2h8',
    reception: '6:00 PM at C.S.I PARISH HALL Pilankantuvilai',
    rsvp: 'Your presence would mean the world to us',
    welcome: 'With grateful hearts, we invite you to share in the beginning of our life together. Your presence and blessings will make our day complete.',
    blessing: 'And now these three remain: faith, hope and love. But the greatest of these is love. — 1 Corinthians 13:13',
  };

  protected readonly countdown = signal<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    message: '',
  });

  private countdownTimer?: ReturnType<typeof setInterval>;

  protected readonly calendarWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  protected readonly calendarGrid: CalendarDay[] = (() => {
    // January 2027: starts on Friday (day index 5), 31 days
    const firstDayIndex = new Date(2027, 0, 1).getDay(); // 5 = Friday
    const daysInMonth = 31;
    const grid: CalendarDay[] = [];

    // Empty cells before the 1st
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push({ day: 0, isWeddingDay: false, isEmpty: true });
    }

    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      grid.push({ day: d, isWeddingDay: d === 18, isEmpty: false });
    }

    return grid;
  })();

  ngOnInit(): void {
    this.updateCountdown();
    this.countdownTimer = setInterval(() => this.updateCountdown(), 60_000);
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }

  protected shareInvitation(): void {
    const message = `Please join us to celebrate the wedding of ${this.wedding.groom} & ${this.wedding.bride} on ${this.wedding.date} at ${this.wedding.venue}, Kanniyakumari. ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }

  protected downloadCalendar(): void {
    const calendar = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding Invitation//EN',
      'BEGIN:VEVENT',
      `UID:wedding-${this.wedding.dateIso}@invitation`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
      `DTSTART;VALUE=DATE:${this.wedding.dateIso.replace(/-/g, '')}`,
      `DTEND;VALUE=DATE:${new Date(new Date(`${this.wedding.dateIso}T00:00:00Z`).getTime() + 86_400_000).toISOString().slice(0, 10).replace(/-/g, '')}`,
      `SUMMARY:Wedding of ${this.wedding.groom} and ${this.wedding.bride}`,
      `LOCATION:${this.wedding.address}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'renolin-and-evanchelin-wedding.ics';
    link.click();
    URL.revokeObjectURL(url);
  }

  private updateCountdown(): void {
    const target = new Date(`${this.wedding.dateIso}T10:00:00+05:30`).getTime();
    const remaining = target - Date.now();

    if (remaining <= 0) {
      this.countdown.set({
        days: 0,
        hours: 0,
        minutes: 0,
        message: remaining > -86_400_000
          ? 'Today is the day. Let the celebration begin.'
          : 'Thank you for celebrating with us.',
      });
      return;
    }

    const totalMinutes = Math.floor(remaining / 60_000);
    this.countdown.set({
      days: Math.floor(totalMinutes / 1_440),
      hours: Math.floor((totalMinutes % 1_440) / 60),
      minutes: totalMinutes % 60,
      message: '',
    });
  }
}
