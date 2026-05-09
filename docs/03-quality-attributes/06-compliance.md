# Compliance

- [Docs Home](../README.md)
- [Quality Attributes Index](./README.md)

### 7.6 Compliance

##### NFR-COMP-001: Healthcare Compliance

- ID
- Requirement
- Acceptance Criteria
- NFR-COMP-001.1
- Data Security
- - PHI encryption at rest and in transit- Access controls and audit logs- Business Associate Agreements (BAAs)- Regular compliance audits
- NFR-COMP-001.2
- Data retention
- - Medical records: 7 years- Payment records: indefinite- Prescription records: 7 years- Audit logs: 7 years
- NFR-COMP-001.3
- Patient rights
- - Data access (patient can download data)- Data deletion (right to be forgotten)- Data portability (export to JSON/PDF)- Privacy policy acceptance

##### NFR-COMP-002: Payment Compliance

- ID
- Requirement
- Acceptance Criteria
- NFR-COMP-002.1
- PCI DSS compliance
- - Never store card details- Stripe handles payment data- Tokenization for payment methods- Annual PCI audit
- NFR-COMP-002.2
- Financial regulations
- - Invoice generation- Tax calculations (if applicable)- Refund processing- Transaction records
