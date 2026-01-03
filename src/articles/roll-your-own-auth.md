---
title: Maybe don't roll your own auth
preview: true
author: Wakunguma Kalimukwa
synopsis: Don't roll your own auth
image: /internal/thumbnails/roll-your-own-auth.png
imageAsset: ../assets/internal/thumbnails/roll-your-own-auth.png
imageSize: 12
published: 2025-08-30
tags:
  - Auth
---

**Resoures:**
- [Microsoft Research](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/06/Microsoft_Password_Guidance-1.pdf)
- [Microsoft blog](https://techcommunity.microsoft.com/blog/microsoft-entra-blog/your-paword-doesnt-matter/731984)
  
The typical advice is not to roll your own auth. However on the surface level it seems 
fairly simple enough, all you need is an email, password and a user id, the rest is history. 
But it quickly becomes a project itself. It's not that you can't, it's that you probably don't want to. 
Authentication is a side effect of having users, your users need accounts which need to be accessible 
and secure, hence your app needs authentication. However, **you** don't to build authentication, 
it's merely something you need. Your time would be much better spent actually developing the product. 
All it takes is one simple mistake to screw everything up. Human dumb sometimes, human make mistake.


Alas, you might want to roll your own regardless, so these are some of the things you'll 
need to keep track of:

## Emails
There will need to be some form of communication between the software and the user, and this 
is usually done via an email address. 

### Email validation
You'll need to validate that an email exists and that the user has access to it. The only way to 
**truly** validate an email is by sending a code or url key and user to verify by input. 
Regex won't cut it. The following are all valid email addresses as defined in 
[RFC2822](https://datatracker.ietf.org/doc/html/rfc2822#section-3.4.1). 

- user@[192.168.2.1]
- "()<>[]:,;@\\\"!#$%&'-/=?^_`{}| ~.a"@example.org
- postmaster@[IPv6:2001:db8::1]

Specifically an email can contain any string, followed by an @, then a domain, 
which can also be a direct IP address. Although many email providers have stricter requirements that this. 

## Passwords
It's also important to make sure that users have a strong enough password to prevent the changes of 
brute force attacks. 

- Passwords must have a maximum length of at least 64 characters, extremely long passwords can cause
denial of service attacks.
- Passwords should have character requirements, such as both upper and lowercase, these are largely 
unfounded. 
- Passwords should be among the 10,000 most commonly used passwords.
- Extremely easy to guess password, such as '12345678' or 'password', should strictly be forbidden.

The general strength of users passwords is going to affect your application and how you secure it. The
ideal world is that everyone used a secure password generator, like bitwarden or the one in browsers,
but that is hard to enforce.  

It's also important to find some sort of balance, users default to picking simple password especially
when frustrated.

### Email & password change / recovery
The user will need the ability to change their password, 
almost always by sending a code or link, securely, to their email. This is also used if a user 
forgets their password. It's important that this is secure as it can be used by attackers to reset a 
users password and gain access to their account.

## Combined identities
You might want a way to join identities. A user might have initially joined the website with their 
email and password, but now they want to add their Google account for quicker login, both identities 
will need to be associated to a single user. The identities are separate, they have separate sessions 
and details but share a user. In addition to that you'll also need to prevent accounts from different 
providers that have the same email.

## Session

A session is created when a user signs in, it uniquely identifies them across requests and 
interactions. The session id is the form of authorization that the user uses after signing in
as such it of extreme importance and should only be accessible by the user and the service.  
Session ids must have enough randomness to prevent guessing, at least 64 bits.

### Managing sessions
Users will need access to all the sessions they have across devices, with the ability to revoke any 
and all sessions.

## MFA
Multifactor Authentication (MFA) is when a user is required to present more than one type of evidence 
in order to authenticate on a system. Despite your best efforts, users are susceptible to choosing 
weak password, because they are easy to remember or because they didn't have access to their password 
generator at that time.

However, MFA can quite often lead to user dissatisfaction, leading to them disabling it.
This would defeat all your efforts to make it more secure. You could enable threat based MFA,
such as only requiring it on new browsers or devices, or maybe using geolocation.


### Email verification
The simplest implementation of MFA, from a developers perspective, is email verification. The user signs 
in and is sent either a key or a url to confirm that they are the owner of that email. This can help mitigate 
attacks where only a user's password was compromised. It also lets you inform users, if there have been failed
attempts on unrecognised devices.

- Passkeys
- Authenticator apps
- Email address

### Passkeys
In my opinion, by far the most convinient way to log in to a website is using a [passkey](https://www.passkeys.io/), 
such as fingerprint or Face ID. It secure because you are who you are, and it is convenient 
and quick. Passkeys prevent all phishing based attacks. Although currently [not that many](https://www.passkeys.io/who-supports-passkeys) 
websites support passkeys.

It's also unlikely for an app to only use passkeys, since the user might not have access to their device,
so password are typically required as well.

## Providers
These are some providers that you can use:
- KeyCloak
- [Clerk](https://clerk.com/)
- [Supabase](https://supabase.com/docs/guides/auth)



