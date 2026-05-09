# Payment Management

- [Docs Home](../../README.md)
- [Feature Index](./README.md)

## 4. Payment Management Module (Stripe Integration)

### 4.1 Payment Processing

##### FR-PAYMENT-001: Initiate Payment

| Field | Value |
| --- | --- |
| Priority | CRITICAL |
| User Story | As a patient, I want to pay for my appointment so that my booking is confirmed. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-001.1 | System must create payment record | - Create Payment entry when appointment booked<br>- Link to appointment (appointmentId)<br>- Set status to PENDING<br>- Store amount from doctor fee |
| FR-PAYMENT-001.2 | System must integrate with Stripe | - Create Stripe Payment Intent<br>- Use Stripe API v2023+<br>- Handle currency (USD default)<br>- Return client secret for frontend |
| FR-PAYMENT-001.3 | System must generate payment link | - Create checkout session URL<br>- Include appointment details<br>- Set success/cancel redirect URLs<br>- Include metadata (appointmentId, patientId) |
| FR-PAYMENT-001.4 | System must set payment expiry | - Payment valid for 30 minutes<br>- Auto-cancel appointment if expired<br>- Release schedule slot<br>- Send expiry notification |
| FR-PAYMENT-001.5 | System must enforce security | - Validate payment amount matches appointment<br>- Prevent amount tampering<br>- Use idempotency keys<br>- Log all payment attempts |

###### Input (Internal - called during appointment creation)

```ts
{
  appointmentId: string (required, valid UUID),
  amount: number (required, from doctor.appointmentFee),
  currency: string (default: 'USD')
}
```

##### FR-PAYMENT-002: Process Payment Webhook

| Field | Value |
| --- | --- |
| Priority | CRITICAL |
| User Story | As the system, I want to process Stripe webhook events so that payment status is updated in real-time. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-002.1 | System must verify webhook signature | - Validate Stripe signature<br>- Use webhook secret from env<br>- Reject invalid signatures<br>- Prevent replay attacks |
| FR-PAYMENT-002.2 | System must handle payment success event | - Event: payment_intent.succeeded<br>- Update Payment status to PAID<br>- Store transaction ID<br>- Record payment timestamp |
| FR-PAYMENT-002.3 | System must confirm appointment | - Update appointment status if needed<br>- Send confirmation email<br>- Activate video call link<br>- Send SMS notification (optional) |
| FR-PAYMENT-002.4 | System must handle payment failure | - Event: payment_intent.payment_failed<br>- Update Payment status to FAILED<br>- Cancel appointment<br>- Release schedule slot<br>- Notify patient |
| FR-PAYMENT-002.5 | System must handle idempotency | - Check if event already processed<br>- Store processed event IDs<br>- Prevent duplicate processing<br>- Return 200 for duplicates |
| FR-PAYMENT-002.6 | System must log webhook events | - Log all webhook calls<br>- Store event type and data<br>- Audit trail for disputes<br>- Debug failed transactions |

###### Webhook Events Handled

```ts
{
  'payment_intent.succeeded': handlePaymentSuccess,
  'payment_intent.payment_failed': handlePaymentFailure,
  'payment_intent.canceled': handlePaymentCancellation,
  'charge.refunded': handleRefund
}
```

##### FR-PAYMENT-003: Process Refund

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a patient, I want to receive refund when appointment is cancelled so that I get my money back. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-003.1 | System must calculate refund amount | - Apply cancellation policy<br>- Full refund: >24 hours before<br>- Partial refund: 12-24 hours before<br>- No refund: <12 hours before |
| FR-PAYMENT-003.2 | System must process Stripe refund | - Create Stripe refund<br>- Specify refund amount<br>- Include refund reason<br>- Store refund ID |
| FR-PAYMENT-003.3 | System must update payment record | - Update status to REFUNDED or PARTIAL_REFUND<br>- Store refund amount<br>- Store refund timestamp<br>- Link to Stripe refund ID |
| FR-PAYMENT-003.4 | System must handle refund webhook | - Event: charge.refunded<br>- Confirm refund processed<br>- Update local records<br>- Send confirmation email |
| FR-PAYMENT-003.5 | System must enforce refund rules | - Can only refund PAID payments<br>- Cannot refund already refunded<br>- Cannot exceed original amount<br>- Validate appointment cancellation |

###### Input (Internal - called during cancellation)

```ts
{
  paymentId: string (required, valid UUID),
  refundType: 'FULL' | 'PARTIAL' (required),
  reason: string (optional, cancellation reason)
}
```

##### FR-PAYMENT-004: Get Payment Details

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a patient/admin, I want to view payment details so that I can track transaction history. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-004.1 | System must return payment details | - All payment fields<br>- Appointment reference<br>- Stripe transaction IDs<br>- Payment timeline |
| FR-PAYMENT-004.2 | System must include transaction history | - Payment attempts<br>- Status changes<br>- Refund history<br>- Timestamps |
| FR-PAYMENT-004.3 | System must enforce authorization | - Patient can view own payments<br>- Doctor can view their appointment payments<br>- Admin can view all payments |
| FR-PAYMENT-004.4 | System must mask sensitive data | - Mask card details (if stored)<br>- Show last 4 digits only<br>- Hide full transaction IDs from patient<br>- Admin sees full details |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Payment details retrieved successfully",
  "data": {
    "id": "payment-uuid",
    "appointmentId": "appointment-uuid",
    "amount": 500,
    "currency": "USD",
    "status": "PAID",
    "paymentMethod": "card",
    "cardLast4": "4242",
    "stripePaymentIntentId": "pi_xxx",
    "transactionId": "ch_xxx",
    "createdAt": "2026-01-29T10:00:00Z",
    "paidAt": "2026-01-29T10:05:00Z",
    "refundHistory": []
  }
}
```

##### FR-PAYMENT-005: Get Payment History

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a patient, I want to view my payment history so that I can track my medical expenses. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-005.1 | System must return user payment list | - Filter by user (patient/doctor)<br>- Include appointment details<br>- Include doctor/patient info<br>- Paginated results |
| FR-PAYMENT-005.2 | System must support filtering | - Filter by status (PAID, PENDING, REFUNDED)<br>- Filter by date range<br>- Filter by amount range<br>- Search by appointment |
| FR-PAYMENT-005.3 | System must calculate totals | - Total amount paid<br>- Total refunded<br>- Net amount<br>- Tax breakdown (if applicable) |
| FR-PAYMENT-005.4 | System must support export | - Export as PDF (invoice format)<br>- Export as CSV<br>- Include all transactions<br>- Tax-compliant format |

###### Query Parameters

```ts
{
  page: number (default: 1),
  limit: number (default: 10, max: 100),
  status: PaymentStatus (optional),
  startDate: string (optional, ISO date),
  endDate: string (optional, ISO date),
  sortBy: string (default: 'createdAt'),
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

### 4.2 Payment Administration

##### FR-PAYMENT-006: Admin Payment Dashboard

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As an admin, I want to view payment analytics so that I can monitor revenue and transactions. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-006.1 | System must provide payment analytics | - Total revenue (all time, monthly, daily)<br>- Payment status breakdown<br>- Refund statistics<br>- Average transaction value |
| FR-PAYMENT-006.2 | System must show payment trends | - Revenue over time (chart data)<br>- Successful payment rate<br>- Failed payment analysis<br>- Refund rate |
| FR-PAYMENT-006.3 | System must list recent transactions | - Last 50 transactions<br>- Filter by status<br>- Search by patient/doctor<br>- Export capability |
| FR-PAYMENT-006.4 | System must handle manual actions | - Manual refund processing<br>- Resolve failed payments<br>- Update payment status (admin override)<br>- Add payment notes |
| FR-PAYMENT-006.5 | System must enforce admin authorization | - Only SUPER_ADMIN and ADMIN access<br>- Log all admin actions<br>- Audit trail for financial compliance |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Payment analytics retrieved successfully",
  "data": {
    "overview": {
      "totalRevenue": 125000,
      "monthlyRevenue": 25000,
      "todayRevenue": 2500,
      "totalTransactions": 250,
      "successRate": 95.5,
      "refundRate": 8.2
    },
    "statusBreakdown": {
      "PAID": 220,
      "PENDING": 15,
      "FAILED": 10,
      "REFUNDED": 5
    },
    "recentTransactions": [
      {
        "id": "payment-uuid",
        "amount": 500,
        "status": "PAID",
        "patient": "John Doe",
        "doctor": "Dr. Smith",
        "paidAt": "2026-01-29T10:05:00Z"
      }
    ]
  }
}
```

##### FR-PAYMENT-007: Generate Invoice

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a patient, I want to download invoice for my payment so that I can claim insurance reimbursement. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-007.1 | System must generate PDF invoice | - Professional invoice format<br>- Include company details<br>- Include patient details<br>- Include itemized charges |
| FR-PAYMENT-007.2 | System must include required information | - Invoice number (unique)<br>- Date of service<br>- Doctor information<br>- Payment details<br>- Tax information (if applicable) |
| FR-PAYMENT-007.3 | System must support tax compliance | - Tax ID/GST number<br>- Tax breakdown<br>- Compliant with local regulations<br>- Audit-ready format |
| FR-PAYMENT-007.4 | System must store invoice history | - Archive generated invoices<br>- Re-download capability<br>- Version tracking<br>- 7-year retention |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Invoice generated successfully",
  "data": {
    "invoiceNumber": "INV-2026-00123",
    "invoiceDate": "2026-01-29",
    "invoiceUrl": "https://s3.amazonaws.com/invoices/INV-2026-00123.pdf",
    "downloadUrl": "https://signed-url-expires-in-24hr"
  }
}
```
