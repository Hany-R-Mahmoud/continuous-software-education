# Cursor Team Plans & Admin Visibility

> **Comprehensive guide to Cursor IDE team plans, user roles, and what administrators can see about team members**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Team Plans](#team-plans)
3. [User Roles](#user-roles)
4. [Admin Visibility & Analytics](#admin-visibility--analytics)
5. [Team Management Features](#team-management-features)
6. [Security & SSO](#security--sso)
7. [Usage Controls](#usage-controls)
8. [Admin API](#admin-api)

---

## Overview

Cursor IDE offers comprehensive team management features designed for organizations of all sizes. Team plans enable centralized billing, user management, and analytics while maintaining security and control over team resources.

This guide covers:

- Available team plans and their features
- Different user roles and their permissions
- What information admins can access about team members
- Team management capabilities
- Security features including SSO
- Usage monitoring and controls

---

## Team Plans

Cursor offers several team plan tiers, each with different features and capabilities:

### Business Plan

- **Team Management**: Full administrative control
- **SSO Support**: SAML 2.0 Single Sign-On integration
- **Usage Analytics**: Comprehensive team-wide metrics
- **Usage Controls**: Spending limits and usage-based pricing
- **Priority Support**: Enhanced customer support

### Enterprise Plan

- **All Business Features**: Everything included in Business plan
- **Advanced Security**: Enhanced security features
- **Custom Contracts**: Tailored agreements for large organizations
- **Dedicated Support**: Enterprise-level support

### Key Differences from Individual Plans

- Centralized billing and management
- Team-wide analytics and reporting
- Role-based access control
- SSO integration capabilities
- Usage monitoring and controls

---

## User Roles

Cursor teams support three distinct user roles, each with specific permissions and billing implications:

### 1. Member

**Capabilities:**

- ✅ Full access to all Pro features
- ✅ Can invite other team members
- ❌ No access to billing settings
- ❌ No access to admin dashboard
- ❌ Cannot view team analytics

**Billing:**

- Each member occupies a **billable seat**
- Billing is prorated when members are added or removed

**Use Case:**
Standard team members who need full Cursor Pro functionality for development work.

---

### 2. Admin

**Capabilities:**

- ✅ Full access to all Pro features
- ✅ Complete team management:
  - Add/remove team members
  - Modify user roles
  - Configure SSO settings
  - Access billing and payment settings
- ✅ Team analytics and reporting
- ✅ Usage controls and spending limits
- ✅ Configure usage-based pricing

**Billing:**

- Each admin occupies a **billable seat**
- Requires at least one paid member on the team

**Use Case:**
Team leads, engineering managers, or IT administrators who need both Cursor access and team management capabilities.

---

### 3. Unpaid Admin

**Capabilities:**

- ✅ Full administrative capabilities (same as Admin)
  - Team management
  - SSO configuration
  - Analytics access
  - Billing management
- ❌ **No access to Pro features**
- ❌ Cannot use Cursor IDE for development

**Billing:**

- **Does NOT occupy a billable seat**
- Requires at least one paid user on the team

**Use Case:**
IT staff, finance personnel, or managers who need to manage the team but don't require Cursor IDE access themselves.

**Important Notes:**

- Must have at least one paid Admin or Member on the team
- Ideal for organizations wanting to separate tool access from administrative control
- Cost-effective for teams with non-technical administrators

---

## Admin Visibility & Analytics

Admins have comprehensive visibility into team activity and member information through the **Admin Dashboard**. Here's what admins can see:

### Team-Wide Metrics

#### Total Usage (Past 30 Days)

- **Tabs Accepted**: Total number of AI-generated code suggestions accepted by the team
- **Premium Requests**: Aggregate count of premium API requests used
- **Lines of Code**: Total lines of code generated/edited
- **Time Period**: Metrics reflect the past 30 days, or since team creation if less than 30 days old

**Note:** For teams less than 30 days old, metrics include:

- Activity from team creation date
- Historical activity from members' individual accounts before joining the team

#### Per Active User Metrics

- **Average Tabs Accepted**: Mean number of accepted suggestions per active user
- **Average Lines of Code**: Mean lines of code per active user
- **Average Premium Requests**: Mean premium requests per active user

#### User Activity Tracking

- **Weekly Active Users (WAU)**: Number of unique users active in the past 7 days
- **Monthly Active Users (MAU)**: Number of unique users active in the past 30 days
- **Engagement Trends**: Track user engagement over time

### Member Information Visibility

Admins can view the following information about team members:

#### Basic Member Details

- **Email Address**: Member's email used for account
- **Name**: Display name (if provided)
- **Role**: Current role (Member, Admin, or Unpaid Admin)
- **Status**: Active, Pending invitation, or Removed
- **Join Date**: When the member joined the team
- **Last Active**: Last activity timestamp (if available)

#### Usage Information

- **Individual Usage Metrics**:
  - Tabs accepted by the member
  - Premium requests used
  - Lines of code generated
- **Activity Patterns**:
  - Frequency of usage
  - Active days/weeks
- **Billing Information**:
  - Seat allocation
  - Prorated billing details

#### Team Management Data

- **Invitation Status**: Pending, accepted, or expired invitations
- **SSO Status**: Whether member is SSO-enabled (if SSO is configured)
- **Domain Association**: Email domain (for SSO domain verification)

### What Admins Cannot See

For privacy reasons, admins typically **cannot** see:

- ❌ Specific code or files members are working on
- ❌ Conversation history or chat logs
- ❌ Personal settings or preferences
- ❌ Individual project details
- ❌ Private repositories or code content

**Focus:** Admin visibility is limited to **aggregate usage metrics** and **team management data**, not individual work content.

---

## Team Management Features

### Adding Members

#### Email Invitations

1. Navigate to Team Settings → Members
2. Click "Add Member"
3. Enter email address
4. Select role (Member or Admin)
5. Send invitation

#### Shareable Invite Links

- Generate team-specific invite links
- Share with multiple users
- Links can be set to expire
- Role assignment can be configured

#### SSO Auto-Enrollment

- Automatic user enrollment when SSO is configured
- Domain verification required
- Users with verified domain emails can join automatically
- Can be enforced (SSO-only access)

### Removing Members

**Process:**

1. Navigate to Team Settings → Members
2. Select member to remove
3. Click "Remove Member"
4. Confirm removal

**Billing Impact:**

- Billing is **prorated** based on active period
- Charges adjust automatically
- No additional fees for removal

**Important:**

- Must maintain at least **one Admin** and **one paid member** at all times
- Cannot remove the last admin
- Cannot remove all paid members

### Role Management

**Changing Roles:**

- Admins can change any member's role
- Changes take effect immediately
- Billing adjusts based on role (Unpaid Admin doesn't count as seat)

**Role Change Scenarios:**

- **Member → Admin**: Gains admin privileges, billing unchanged
- **Admin → Member**: Loses admin privileges, billing unchanged
- **Admin → Unpaid Admin**: Loses Pro access, billing seat freed
- **Unpaid Admin → Admin**: Gains Pro access, billing seat added

**Restrictions:**

- Cannot demote the last Admin
- Cannot remove all paid members

---

## Security & SSO

### Single Sign-On (SSO) Support

**Available Plans:**

- Business Plan
- Enterprise Plan

**Supported Protocol:**

- **SAML 2.0** standard

**Identity Provider Support:**

- Okta
- Azure AD (Microsoft Entra ID)
- Other SAML 2.0 compliant providers

### SSO Configuration

#### Domain Verification

1. Verify organization domain ownership
2. Configure DNS records or other verification method
3. Complete domain verification process

#### SSO Setup Steps

1. Navigate to Team Settings → Security
2. Enable SSO
3. Configure SAML settings:
   - Identity Provider URL
   - Certificate
   - Attribute mappings
4. Test SSO connection
5. Enable SSO enforcement (optional)

#### SSO Features

- **Automatic User Enrollment**: Users with verified domain emails can join automatically
- **SSO Enforcement**: Require SSO for all team access
- **Domain-Based Access**: Control access by email domain
- **Centralized Authentication**: Manage authentication through identity provider

### Security Benefits

- Centralized user management
- Enhanced security through identity provider
- Automatic user provisioning/deprovisioning
- Compliance with organizational security policies
- Audit trails through identity provider

---

## Usage Controls

Admins can configure usage controls to manage team costs and resource utilization:

### Usage-Based Pricing

**Configuration:**

- Enable/disable usage-based pricing
- Set pricing tiers or limits
- Configure billing thresholds

**Use Cases:**

- Teams with variable usage patterns
- Cost optimization
- Fair resource allocation

### Spending Limits

**Features:**

- Set monthly spending limits per team
- Configure alerts when approaching limits
- Automatic throttling or blocking at limits
- Per-user spending limits (if available)

**Benefits:**

- Budget control
- Cost predictability
- Prevent unexpected charges

### Usage Monitoring

**Real-Time Monitoring:**

- Current month usage
- Projected costs
- Spending trends
- Alert notifications

**Reporting:**

- Monthly usage reports
- Cost breakdowns
- User-level usage summaries
- Historical trends

---

## Admin API

For advanced teams, Cursor provides an **Admin API** for programmatic access to team data:

### Available Data

#### Team Information

- Team details and settings
- Member list and roles
- Billing information
- SSO configuration status

#### Usage Metrics

- Team-wide usage statistics
- Per-user usage data
- Historical usage trends
- Cost and billing data

#### Management Operations

- Add/remove members (via API)
- Modify roles
- Configure settings
- Retrieve analytics data

### Use Cases

**Custom Dashboards:**

- Build internal dashboards
- Integrate with existing tools
- Create custom reporting

**Monitoring & Alerts:**

- Set up custom monitoring
- Integrate with alerting systems
- Automated reporting

**Workflow Integration:**

- Integrate with HR systems
- Automate user provisioning
- Sync with other development tools

### API Access

**Authentication:**

- API keys or OAuth tokens
- Secure authentication required
- Role-based access control

**Documentation:**

- Full API documentation available
- Endpoint reference
- Authentication guide
- Example integrations

**Access:**

- Available through Cursor account settings
- Admin-only access
- Secure key management

---

## Best Practices

### Team Management

1. **Role Assignment**

   - Use Unpaid Admin for non-technical staff
   - Maintain at least one paid Admin
   - Assign Member role to active developers

2. **Member Onboarding**

   - Use SSO for seamless onboarding
   - Set up invite links for quick access
   - Provide role-based training

3. **Usage Monitoring**
   - Review analytics regularly
   - Set appropriate spending limits
   - Monitor for unusual patterns

### Security

1. **SSO Implementation**

   - Enable SSO for Business/Enterprise plans
   - Use domain verification
   - Enforce SSO when appropriate

2. **Access Control**

   - Regularly review member list
   - Remove inactive members promptly
   - Audit role assignments

3. **Billing Management**
   - Monitor spending limits
   - Review usage reports
   - Optimize seat allocation

### Analytics & Reporting

1. **Regular Reviews**

   - Weekly or monthly analytics review
   - Track engagement trends
   - Identify optimization opportunities

2. **Custom Reporting**
   - Use Admin API for custom reports
   - Integrate with existing dashboards
   - Share insights with stakeholders

---

## Summary

### Key Takeaways

1. **Three User Roles:**

   - **Member**: Full Pro access, billable seat
   - **Admin**: Full Pro access + management, billable seat
   - **Unpaid Admin**: Management only, no seat cost

2. **Admin Visibility:**

   - Team-wide usage metrics (tabs, requests, code)
   - Per-user activity and engagement
   - Member information (email, role, status)
   - Billing and seat allocation
   - **Cannot see**: Individual code, conversations, or private work

3. **Team Management:**

   - Add/remove members via email or invite links
   - Change roles and manage permissions
   - Configure SSO for Business/Enterprise plans
   - Set usage controls and spending limits

4. **Analytics & Monitoring:**

   - 30-day usage metrics
   - Active user tracking
   - Per-user averages
   - Custom reporting via Admin API

5. **Security Features:**
   - SAML 2.0 SSO support
   - Domain verification
   - Centralized authentication
   - Role-based access control

---

## Resources

- [Cursor Team Management Documentation](https://cursordocs.com/en/docs/plans/business/team-management)
- [Cursor Members and Roles Guide](https://www.aidoczh.com/cursor/account/teams/members.html)
- [Cursor Analytics Documentation](https://www.aidoczh.com/cursor/account/teams/analytics.html)
- [Cursor Security & SSO Guide](https://www.aidoczh.com/cursor/account/teams/members.html)
- [Cursor Admin API Documentation](https://anysphere.mintlify.app/en/account/teams/admin-api)

## Resources

- [Cursor Team Management Documentation](https://cursordocs.com/en/docs/plans/business/team-management)
- [Cursor Members and Roles Guide](https://www.aidoczh.com/cursor/account/teams/members.html)
- [Cursor Analytics Documentation](https://www.aidoczh.com/cursor/account/teams/analytics.html)
- [Cursor Security & SSO Guide](https://www.aidoczh.com/cursor/account/teams/members.html)
- [Cursor Admin API Documentation](https://anysphere.mintlify.app/en/account/teams/admin-api)

---

## Notes

- Team plans require at least one paid Admin or Member
- Billing is prorated when members are added or removed
- SSO is available on Business and Enterprise plans only
- Admin visibility focuses on aggregate metrics, not individual work content
- Usage controls help manage costs and ensure fair resource allocation
- Admin API enables custom integrations and reporting

## Notes

- Team plans require at least one paid Admin or Member
- Billing is prorated when members are added or removed
- SSO is available on Business and Enterprise plans only
- Admin visibility focuses on aggregate metrics, not individual work content
- Usage controls help manage costs and ensure fair resource allocation
- Admin API enables custom integrations and reporting

---

_Last Updated: Based on current Cursor IDE documentation and features_
