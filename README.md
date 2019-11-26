# in-account-with-role

.h2
Prepare:

$HOME/.aws/config

```
=====
[profile 139627640763_ctraut]
region = eu-central-1
mfa_serial = arn:aws:iam::139627640763:mfa/ctraut

[profile 037739703493-company_managed/UserRole]
region = eu-central-1
source_profile = 139627640763_ctraut
role_arn = arn:aws:iam::037739703493:role/company_managed/UserRole
=====

$HOME/.aws/credentials

=====
[139627640763_ctraut]
aws_access_key_id = AKIASBAT....7EK
aws_secret_access_key = GiV......qC7Vi
aws_mfa_secret = VP5PRD......AC44G3UEQ
=====

Usage: 
npx --quiet https://github.com/trautw/in-account-with-role  <AWS_ACCOUNT> <AWS_ROLE> <COMMAND WITH ARGS>

Sample:
npx --quiet https://github.com/trautw/in-account-with-role  037739773493 company_managed/UserRole aws sts get-caller-identity
