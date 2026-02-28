import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'sample-data');

function createPDF(filename, title, content) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const filePath = path.join(outDir, filename);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(1.5);

    // Content
    doc.fontSize(11).font('Helvetica');
    for (const line of content.split('\n')) {
      if (line.startsWith('##')) {
        doc.moveDown(0.5);
        doc.fontSize(14).font('Helvetica-Bold').text(line.replace(/^##\s*/, ''));
        doc.fontSize(11).font('Helvetica');
        doc.moveDown(0.3);
      } else if (line.startsWith('#')) {
        doc.moveDown(0.8);
        doc.fontSize(16).font('Helvetica-Bold').text(line.replace(/^#\s*/, ''));
        doc.fontSize(11).font('Helvetica');
        doc.moveDown(0.3);
      } else if (line.trim() === '') {
        doc.moveDown(0.4);
      } else {
        doc.text(line, { lineGap: 3 });
      }
    }

    doc.end();
    stream.on('finish', () => {
      console.log(`✅ Created: ${filePath}`);
      resolve();
    });
    stream.on('error', reject);
  });
}

// --- QUESTIONNAIRE PDF ---
const questionnaire = `# Vendor Security Assessment Questionnaire

This questionnaire is designed to evaluate the security posture of prospective vendors. Please answer each question thoroughly with supporting evidence where applicable.

## Section A: Security Governance

1. What security certifications does your organization currently hold (e.g., SOC 2, ISO 27001, HIPAA)?

2. How is customer data encrypted at rest and in transit across your platform?

3. Describe your incident response process, including average response and resolution times.

## Section B: Access & Infrastructure

4. What access control mechanisms are in place to limit employee access to customer data?

5. How do you handle vulnerability management and patching across your infrastructure?

6. What is your data retention and deletion policy when a customer terminates service?

## Section C: Compliance & Continuity

7. Describe your disaster recovery and business continuity plans, including RTO and RPO targets.

8. How do you ensure compliance with GDPR and other international data protection regulations?

9. What third-party services or subprocessors have access to customer data, and how are they vetted?

## Section D: Technical Security

10. Describe your network security architecture, including firewall rules, segmentation, and intrusion detection systems.

11. How are API keys and secrets managed within your development and production environments?

12. What security awareness training programs are provided to your employees, and how frequently?`;

// --- REFERENCE DOC 1: Security Policy ---
const securityPolicy = `# ShieldSync Inc. — Information Security Policy
Version 3.2 | Effective Date: January 15, 2026

## 1. Purpose
This document establishes the information security policy for ShieldSync Inc. and all subsidiaries. It defines the controls, procedures, and responsibilities necessary to protect company and customer data assets.

## 2. Scope
This policy applies to all employees, contractors, and third-party partners who access ShieldSync systems, networks, or data.

## 3. Security Certifications
ShieldSync currently maintains the following certifications:
- SOC 2 Type II (renewed annually, last audit completed December 2025)
- ISO 27001:2022 (certified since 2023)
- HIPAA Compliance (for healthcare sector clients)
- PCI DSS Level 1 (for payment processing modules)

## 4. Encryption Standards
All customer data is encrypted using industry-standard algorithms:
- Data at rest: AES-256 encryption on all databases, file stores, and backups
- Data in transit: TLS 1.3 enforced for all API and web traffic
- Key management: AWS KMS with automatic key rotation every 90 days
- Database-level encryption: Transparent Data Encryption (TDE) enabled on all RDS instances

## 5. Access Control
ShieldSync implements a Zero Trust access model:
- Role-Based Access Control (RBAC) with principle of least privilege
- Multi-Factor Authentication (MFA) required for all employees and contractors
- Just-In-Time (JIT) access provisioning for production environments
- Quarterly access reviews conducted by the Security Team
- All privileged access logged and monitored via SIEM

## 6. Vulnerability Management
- Automated vulnerability scanning performed weekly using Qualys
- Penetration testing conducted quarterly by independent third parties
- Critical patches applied within 24 hours of release
- High-severity patches applied within 72 hours
- Medium and low patches addressed within monthly maintenance windows

## 7. Security Training
All employees undergo mandatory security awareness training:
- Annual comprehensive training (8 hours) covering data handling, phishing, social engineering
- Quarterly refresher modules (2 hours) on emerging threats
- Monthly phishing simulation exercises with targeted follow-up training
- Specialized training for developers on secure coding practices (OWASP Top 10)
- New hire security onboarding completed within first week of employment`;

// --- REFERENCE DOC 2: Data Handling ---
const dataHandling = `# ShieldSync Inc. — Data Handling & Privacy Policy
Version 2.8 | Effective Date: February 1, 2026

## 1. Data Classification
ShieldSync classifies data into four tiers:
- Public: Marketing materials, public documentation
- Internal: Company policies, internal communications
- Confidential: Customer data, financial records, employee PII
- Restricted: Encryption keys, security credentials, audit logs

## 2. Data Retention
Customer data retention policies:
- Active account data: Retained for the duration of the service agreement plus 30 days
- Upon service termination: All customer data permanently deleted within 30 days of contract end
- Deletion verification: Automated deletion confirmed via audit trail; certificate of destruction provided upon request
- Backup data: Purged from all backup systems within 90 days of deletion request
- Log data: Security and access logs retained for 12 months for forensic purposes

## 3. GDPR Compliance
ShieldSync maintains full GDPR compliance:
- Appointed a Data Protection Officer (DPO): privacy@shieldsync.com
- Data Processing Agreements (DPAs) executed with all customers and subprocessors
- Privacy Impact Assessments (PIAs) conducted for all new features handling personal data
- Right to erasure requests processed within 15 business days
- Data portability: Customers can export all data in standard formats (JSON, CSV) at any time
- Breach notification: Supervisory authorities notified within 72 hours as required

## 4. International Compliance
In addition to GDPR, ShieldSync complies with:
- CCPA (California Consumer Privacy Act) for US customers
- PIPEDA (Personal Information Protection and Electronic Documents Act) for Canadian customers
- LGPD (Lei Geral de Proteção de Dados) for Brazilian customers
- Cross-border data transfers secured via Standard Contractual Clauses (SCCs)

## 5. Third-Party Subprocessors
ShieldSync uses the following vetted subprocessors:
- Amazon Web Services (AWS): Primary cloud infrastructure provider (US and EU regions)
- Datadog: Application monitoring and observability
- Twilio SendGrid: Transactional email delivery
- Stripe: Payment processing
All subprocessors undergo annual security assessments, maintain SOC 2 certification, and sign Data Processing Agreements. A current list is published at shieldsync.com/subprocessors and customers are notified 30 days before any changes.`;

// --- REFERENCE DOC 3: Incident Response ---
const incidentResponse = `# ShieldSync Inc. — Incident Response Plan
Version 4.1 | Effective Date: January 1, 2026

## 1. Overview
This plan establishes the procedures for detecting, responding to, and recovering from security incidents at ShieldSync Inc.

## 2. Incident Classification
Incidents are classified by severity:
- P1 (Critical): Active data breach, system-wide outage, ransomware — Response within 15 minutes
- P2 (High): Suspected breach, partial service degradation — Response within 1 hour
- P3 (Medium): Policy violations, failed intrusion attempts — Response within 4 hours
- P4 (Low): Minor security events, informational alerts — Response within 24 hours

## 3. Response Team
The Incident Response Team (IRT) consists of:
- Incident Commander: VP of Engineering
- Security Lead: Chief Information Security Officer (CISO)
- Communications Lead: VP of Marketing
- Legal Advisor: General Counsel
- Technical Responders: On-call Site Reliability Engineers (SREs)

## 4. Response Process
Step 1 — Detection: Automated alerts from SIEM (Splunk), IDS (Snort), and endpoint protection (CrowdStrike)
Step 2 — Triage: On-call engineer assesses severity and classification within 15 minutes
Step 3 — Containment: Affected systems isolated; credentials rotated; threat vectors blocked
Step 4 — Eradication: Root cause identified and eliminated; patches or configuration changes applied
Step 5 — Recovery: Systems restored from known-good backups; monitoring enhanced
Step 6 — Post-Incident Review: Blameless post-mortem within 48 hours; action items tracked to completion

## 5. Response Metrics
ShieldSync tracks and publishes the following incident response metrics:
- Mean Time to Detect (MTTD): 4.2 minutes (automated detection)
- Mean Time to Respond (MTTR): 18 minutes for P1 incidents
- Mean Time to Resolve: 2.3 hours for P1, 6 hours for P2
- Post-incident reviews completed: 100% within 48 hours
- Incident recurrence rate: Less than 3% over the past 12 months

## 6. Communication Protocol
- Internal stakeholders notified within 30 minutes of P1/P2 incidents
- Affected customers notified within 4 hours for data-related incidents
- Regulatory authorities notified within 72 hours as required by GDPR
- Status page updated in real-time at status.shieldsync.com

## 7. Disaster Recovery
- Recovery Time Objective (RTO): 4 hours for critical systems, 24 hours for non-critical
- Recovery Point Objective (RPO): 1 hour (continuous replication to secondary region)
- Multi-region active-passive deployment on AWS (us-east-1 primary, eu-west-1 secondary)
- Full disaster recovery drills conducted quarterly
- Automated failover tested monthly with synthetic transactions`;

// --- REFERENCE DOC 4: Infrastructure ---
const infrastructure = `# ShieldSync Inc. — Infrastructure & Network Security Overview
Version 2.5 | Effective Date: February 2026

## 1. Cloud Architecture
ShieldSync operates on Amazon Web Services (AWS) with the following architecture:
- Multi-region deployment: US-East-1 (primary), EU-West-1 (secondary/DR)
- Microservices architecture running on Amazon EKS (Kubernetes)
- Auto-scaling configured for all production services
- Infrastructure as Code: 100% managed via Terraform

## 2. Network Security
Network architecture implements defense-in-depth:
- Virtual Private Cloud (VPC) with private subnets for all application and database tiers
- No direct internet access to production servers — all traffic routed through load balancers
- AWS WAF (Web Application Firewall) with custom rule sets for OWASP protection
- Network segmentation: Separate VPCs for production, staging, development, and management
- VPC Flow Logs enabled and shipped to SIEM for analysis

## 3. Firewall & Access Rules
- Security Groups follow deny-all-by-default principle
- Only ports 443 (HTTPS) and 80 (HTTP, redirected to HTTPS) exposed publicly
- Database ports restricted to application-tier security groups only
- SSH access to production requires VPN + bastion host + MFA
- All firewall changes require peer review and approval via change management process

## 4. Intrusion Detection & Prevention
- AWS GuardDuty enabled for continuous threat detection
- Snort IDS deployed on all network boundaries
- CrowdStrike Falcon endpoint protection on all servers and workstations
- Automated blocking of known malicious IPs via threat intelligence feeds
- 24/7 Security Operations Center (SOC) monitoring all alerts

## 5. API & Secret Management
- All API keys and secrets stored in AWS Secrets Manager
- Secrets automatically rotated every 30 days
- No secrets hardcoded in source code — enforced via pre-commit hooks and CI/CD pipeline scanning
- HashiCorp Vault used for dynamic secret generation in production
- Service-to-service authentication via mTLS (mutual TLS) certificates`;

async function main() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await createPDF('questionnaire.pdf', 'Vendor Security Assessment Questionnaire', questionnaire);
  await createPDF('security-policy.pdf', 'Information Security Policy — ShieldSync Inc.', securityPolicy);
  await createPDF('data-handling-policy.pdf', 'Data Handling & Privacy Policy — ShieldSync Inc.', dataHandling);
  await createPDF('incident-response-plan.pdf', 'Incident Response Plan — ShieldSync Inc.', incidentResponse);
  await createPDF('infrastructure-overview.pdf', 'Infrastructure & Network Security — ShieldSync Inc.', infrastructure);

  console.log('\n🎉 All PDF sample files generated in sample-data/');
}

main().catch(console.error);
