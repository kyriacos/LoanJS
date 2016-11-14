import { EventEmitter } from 'events';
import * as money from '../helpers/money';

let tpl =  require('../../tpl/tableRow.tpl');
let loanjs =  require('loanjs');
let loan = loanjs.Loan;

export class CompareRow extends EventEmitter {
  el;
  details;
  currentDetails;

  amount: HTMLInputElement;
  quantity: HTMLInputElement;
  interest: HTMLInputElement;

  equalInterestSum: HTMLSpanElement;
  equalInstallmentAmount: HTMLSpanElement;

  diminishingInterestsSum: HTMLSpanElement;
  diminishingFirstInstallmentAmount: HTMLSpanElement;
  diminishingLastInstallmentAmount: HTMLSpanElement;

  removeBtn: HTMLButtonElement;
  equalDetailsBtn: HTMLButtonElement;
  diminishingDetailsBtn: HTMLButtonElement;

  constructor(public data) {
    super();

    this.render();
  }

  render() {
    if (!this.el) {
      this.el = document.createElement('tr');
      this.el.innerHTML = tpl({data: this.data, trans: window['trans']});

      this.amount = this.el.querySelector('.amount');
      this.quantity = this.el.querySelector('.quantity');
      this.interest = this.el.querySelector('.interest');

      this.listenField(this.amount);
      this.listenField(this.quantity);
      this.listenField(this.interest);

      this.equalInterestSum = this.el.querySelector('.equalInterestSum');
      this.equalInstallmentAmount = this.el.querySelector('.equalInstallmentAmount');

      this.diminishingInterestsSum = this.el.querySelector('.diminishingInterestsSum');
      this.diminishingFirstInstallmentAmount = this.el.querySelector('.diminishingFirstInstallmentAmount');
      this.diminishingLastInstallmentAmount = this.el.querySelector('.diminishingLastInstallmentAmount');

      this.removeBtn = this.el.querySelector('.remove');
      this.removeBtn.addEventListener('click', () => this.onRemove());

      this.equalDetailsBtn = this.el.querySelector('.equalDetails');
      this.equalDetailsBtn.addEventListener('click', () => this.onDetails());

      this.diminishingDetailsBtn = this.el.querySelector('.diminishingDetails');
      this.diminishingDetailsBtn.addEventListener('click', () => this.onDetails(true));
    }

    // counting loan
    this.data.equalLoan = new loan(this.data.amount, Number(this.data.quantity) * 12, this.data.interest);
    this.data.diminishingLoan = new loan(this.data.amount, Number(this.data.quantity) * 12, this.data.interest, true);

    this.data.equalInterestSum = this.data.equalLoan.interestSum;
    this.data.equalInstallmentAmount = this.data.equalLoan.installments[0].installment;

    this.data.diminishingInterestsSum = this.data.diminishingLoan.interestSum;
    this.data.diminishingFirstInstallmentAmount = this.data.diminishingLoan.installments[0].installment;
    this.data.diminishingLastInstallmentAmount = this.data.diminishingLoan.installments[this.data.diminishingLoan.installments.length - 1].installment;

    // Setting InnerHTML of elements
    this.equalInterestSum.innerHTML                  = money(this.data.equalInterestSum);
    this.equalInstallmentAmount.innerHTML            = money(this.data.equalInstallmentAmount);

    this.diminishingInterestsSum.innerHTML           = money(this.data.diminishingInterestsSum);
    this.diminishingFirstInstallmentAmount.innerHTML = money(this.data.diminishingFirstInstallmentAmount);
    this.diminishingLastInstallmentAmount.innerHTML  = money(this.data.diminishingLastInstallmentAmount);

    if (this.currentDetails !== undefined) {
      this.renderDetails(this.currentDetails);
    }
    return this;
  }

  renderDetails (diminishing) {
    let l = diminishing ? this.data.diminishingLoan : this.data.equalLoan;
    this.details.innerHTML = '<td colspan="11">' + loanjs.loanToHtmlTable(l, {formatMoney: money}) + '</td>';
  }

  listenField (field: HTMLInputElement) {
    field.addEventListener('keyup', (e) => this.onFieldChange(e));
    field.addEventListener('change', (e) => this.onFieldChange(e));
  }

  onFieldChange (e) {
    // console.log(e.keyCode);

    // KEYBOARD EVENT  NUMPAD                                   NUMB ERS                               BACKSPACE
    if (e.keyCode && !((e.keyCode >= 96 && e.keyCode <= 105) || (e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode === 8)) {
      return;
    }

    e.target.value = this.data[e.target.className] = parseFloat(e.target.value.replace(',', '.')) || 0;

    this.render();
    this.emit('change');
  }

  onRemove() {
    this.el.parentNode.removeChild(this.el);
    if (this.details) {
      this.details.parentNode.removeChild(this.details);
    }
    this.emit('remove');
  }

  onDetails(diminishing = false) {
    if (!this.details) {
      this.details = document.createElement('tr');
      if (this.el.nextSibling) {
        this.el.parentNode.insertBefore(this.details, this.el.nextSibling);
      } else {
        this.el.parentNode.appendChild(this.details);
      }
    }

    if (this.currentDetails === diminishing) {
      this.details.parentNode.removeChild(this.details);
      this.details = undefined;
      this.currentDetails = undefined;
      return;
    }

    this.currentDetails = diminishing;

    this.renderDetails(diminishing);
  }
};