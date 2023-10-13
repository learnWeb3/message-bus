# Andrew management

This repository contains the code related to the admin panel for the Andrew application's ecosystem.

It uses open id connect authorization code grant flow (standard flow) in order to authenticate the user against a third party authorization server (keycloak)

[Go to Andrew management application](https://andrew-management.students-epitech.ovh/)


## Displayed data

- Global 
  - current sentiment 
  - evolution of the count of positive/negative/neutral news article by year/month/week/day displayed according to global/headline/content/summary scores
  - top 10 keywords count year/month/week/day
- By tag/crypto
  - current sentiment 
  - evolution of the count of positive/negative/neutral news article by year/month/week/day displayed according to global/headline/content/summary with crypto coin prices chart overlay
  - top 10 keywords count year/month/week/day

- Live notification of new processed articles with ability to turn it of, displaying title as link of the article to the scrapped website and colored according to sentiment


- evolution of hot topics over the last year (by month)

## Quick start

```bash
# install project dependencies
npm install
# lauch developement server
npm run dev
```

