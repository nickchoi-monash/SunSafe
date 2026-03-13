import { defineData } from '@aws-amplify/backend';
import { schema } from './schema.sql';

/* Linking the SQL schema and setting the API Key as the primary 
  gatekeeper for the Vue frontend.
*/
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      description: 'SunSafety API Key',
      expiresInDays: 30,
    },
  },
});
