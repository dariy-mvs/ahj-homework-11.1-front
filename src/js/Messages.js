import { ajax } from 'rxjs/ajax';
import { interval, of } from 'rxjs';
import {
  map, catchError, switchMap,
} from 'rxjs/operators';

export default class Messages {
  static editSubject(text) {
    const subject = text.trim();
    if (subject.length > 15) {
      return `${subject.slice(0, 15)}...`;
    }
    return subject;
  }

  constructor() {
    this.server = 'https://t1hw11.herokuapp.com/messages/unread';
    this.messages = document.querySelector('.messages__list');
    this.parentEl = document.querySelector('.email-box');
  }

  init() {
    const data$ = interval(5000).pipe(
      switchMap(() => ajax(this.server).pipe(
        map((result) => result.response),
        catchError(() => of({ timestamp: new Date().toLocaleString('ru'), messages: [] })),
      )),
    );

    data$.subscribe((result) => {
      const receivedData = result || { timestamp: new Date().toLocaleString('ru'), messages: [] };
      receivedData.messages.forEach((item) => {
        this.messages.prepend(this.renderMessage(item));
      });
    });
  }

  renderMessage(message) {
    this.message = document.createElement('li');
    this.message.className = 'message';
    const timeFormat = { minute: '2-digit', hour: '2-digit' };
    const dateFormat = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const received = new Date(message.received);
    this.message.innerHTML = `
    <span class="message__from">${message.from}</span>
    <span class="message__subject">${Messages.editSubject(message.subject)}</span>
    <span class="message__subject_full">${message.subject}</span>
    <p class="message__text">${message.body}</p>
    <span class="message__time">${received.toLocaleString('ru', timeFormat)} ${received.toLocaleString('ru', dateFormat)}</span>
    `;
    this.message.addEventListener('click', (e) => {
      const targetItem = e.target.closest('.message');
      const itemActive = targetItem.classList.contains('active_message');
      if (itemActive) {
        targetItem.querySelector('.message__text').classList.remove('active');
        targetItem.classList.remove('active_message');
      } else {
        targetItem.querySelector('.message__text').classList.add('active');
        targetItem.classList.add('active_message');
      }
    });

    return this.message;
  }
}
