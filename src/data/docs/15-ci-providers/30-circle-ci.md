---
title: 'Circle CI'
excerpt: ''
---

# Circle CI

Circle CI is natively supported in Pmbot. **You will need to use configuration 2.1 and have [pipelines enabled](https://circleci.com/docs/2.0/build-processing/)**.

<div class="blockquote" data-props='{ "mod": "warning" }'>

Pipeline URLs may not always be correct when your pipelines have multiple workflows. We save the URL of the first workflow.
 
</div>

## Repo setup

You'll need to update your `.circleci/config.yml`.

<div class="code-group" data-props='{ "lineNumbers": ["true"], "labels": [".drone.yml"] }'>

```yaml
version: 2.1

# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# This URL contains a token which is renewed every time you disable/enable a repo
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
notify:
  webhooks:
    - url: {{WEBHOOK_URL}}

# parameters sent when we trigger an update
parameters:
  PMBOT:
    type: boolean
    default: false
  PMBOT_UPDATE_ID:
    type: string
    default: ''

jobs:
  # add this job
  update:
    docker:
      - image: pmbot/bot
    environment:
      PMBOT_UPDATE_ID: << pipeline.parameters.PMBOT_UPDATE_ID >>
    steps:
      - checkout
      - run:
          command: |
            # install dependencies for the npm plugin
            npm ci
            pmbot update

workflows:
  update:
    # don't exec this workflow during normal pipelines
    when: << pipeline.parameters.PMBOT >>
    jobs:
      - update

  # some existing workflow
  main:
    # skip this workflow during an update
    unless: << pipeline.parameters.PMBOT >>
    # ...
```

</div>

<div class="blockquote" data-props='{ "mod": "info" }'>

We know that the `if [ ! -z $PMBOT ]; then exit 0; fi` trick isn't really pretty. Drone currently does not support [job conditions](https://docs.drone.io/pipeline/docker/syntax/conditions/) using environment variables, but as soon as it does, we'll update our docs.

For now, you'll also have to repeat the environment definition in the `update` and `notify` steps as it is [currently not possible](https://discourse.drone.io/t/using-from-secrets-in-pipeline-environment-definition/7676/3) to use `from_secret` in the pipeline level environment definition.

</div>

## Self signed certificates

Background information on this topic can be found [`here`](/core/cli#self-signed-certificates).

Define a secret named `PMBOT_TRUSTED_CA` which contains **the content** of your CA certificate file. Then, update your `.drone.yml` as follows:

<div class="code-group" data-props='{ "lineNumbers": ["true"] }'>

```yaml
...

steps:
  - name: update
    ...
    environment:
      PMBOT_TRUSTED_CA:
        from_secret: PMBOT_TRUSTED_CA
    commands:
      ...
      # output your trusted CA content to a file
      - echo $PMBOT_TRUSTED_CA > .ca-cert.pem
      # pass the trusted CA path via the --trusted-ca option
      - pmbot update --trusted-ca .ca-cert.pem --disable-host-key-verification

  ...

  - name: notify
    ...
    environment:
      PMBOT_TRUSTED_CA:
        from_secret: PMBOT_TRUSTED_CA
    commands:
      # output your trusted CA content to a file
      - echo $PMBOT_TRUSTED_CA > .ca-cert.pem
      # pass the trusted CA path via the --trusted-ca option
      - pmbot notify --trusted-ca .ca-cert.pem
```

</div>

<div class="blockquote" data-props='{ "mod": "info" }'>

We were not able to find a way to hide the webhook token. If you know of any, [let us know](https://github.com/pmbot-io/issues/issues) !

</div>