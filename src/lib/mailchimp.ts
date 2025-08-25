import mailchimp from '@mailchimp/mailchimp_marketing';

interface MailchimpConfig {
  apiKey: string;
  serverPrefix: string;
  audienceId: string;
}

function getMailchimpConfig(): MailchimpConfig {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!apiKey || !serverPrefix || !audienceId) {
    throw new Error('Missing MailChimp configuration. Please check environment variables.');
  }

  return { apiKey, serverPrefix, audienceId };
}

function initializeMailchimp(): void {
  const config = getMailchimpConfig();
  
  mailchimp.setConfig({
    apiKey: config.apiKey,
    server: config.serverPrefix,
  });
}

interface SubscribeOptions {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
}

export async function subscribeToMailchimp(options: SubscribeOptions): Promise<void> {
  try {
    initializeMailchimp();
    const config = getMailchimpConfig();

    const mergeFields: Record<string, string> = {};
    if (options.firstName) mergeFields.FNAME = options.firstName;
    if (options.lastName) mergeFields.LNAME = options.lastName;

    const member = {
      email_address: options.email,
      status: 'subscribed' as const,
      merge_fields: mergeFields,
      tags: options.tags || []
    };

    await mailchimp.lists.addListMember(config.audienceId, member);
  } catch (error: unknown) {
    // Handle various MailChimp errors gracefully
    const mailchimpError = error as { status?: number; response?: { body?: { title?: string; detail?: string } }; message?: string };
    
    if (mailchimpError.status === 400) {
      const title = mailchimpError.response?.body?.title;
      
      // Email already exists - this is fine
      if (title === 'Member Exists') {
        return;
      }
      
      // Email was previously deleted and can't be re-imported - treat as success
      if (title === 'Forgotten Email Not Subscribed') {
        console.warn('Email was previously deleted from MailChimp:', options.email);
        return;
      }
    }
    
    console.error('MailChimp API Error:', mailchimpError.response?.body || mailchimpError.message || 'Unknown error');
    throw new Error('Failed to subscribe to mailing list');
  }
}

export async function addEmailToWaitlist(email: string, fullName?: string): Promise<void> {
  const [firstName, ...lastNameParts] = (fullName || '').split(' ');
  const lastName = lastNameParts.join(' ');

  await subscribeToMailchimp({
    email,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    tags: ['waitlist']
  });
}

export async function addPartnerEmail(email: string, company?: string): Promise<void> {
  await subscribeToMailchimp({
    email,
    firstName: company || undefined,
    tags: ['partner']
  });
}