<!-- START -->
# READ AND DELETE THIS SECTION BEFORE SUBMITTING PR
* **Fill out each _REQUIRED_ section**
* **Fill out _OPTIONAL_ sections, remove section if it doesn't apply to your PR**
* **Read and fill out each of the checklists below**
* **Remove this section after reading**
<!-- END -->

# Description
## One Line Summary
**REQUIRED** - Very short description that summaries the changes in this PR.

## Details

### Motivation
**REQUIRED -** Why is this code change being made? Or what is the goal of this PR? Examples: Fixes a specific bug, provides additional logging to debug future issues, feature to allow X.

### Scope
**RECOMMEND - OPTIONAL -** What is intended to be effected. What is known not to change. Example: Notifications are grouped when parameter X is set, not enabled by default.

### OPTIONAL - Other
**OPTIONAL -** Feel free to add any other sections or sub-sections that can explain your PR better.

# Testing
## Unit testing
**OPTIONAL -**  Explain unit tests added, if not clear in the code.

## Manual testing
**RECOMMEND - OPTIONAL -** Explain what scenarios were tested and the environment.
Example: Tested opening a notification while the app was foregrounded, app build with Android Studio 2020.3 with a fresh install of the OneSignal example app on a Pixel 6 with Android 12.

# Affected code checklist
   - [ ] Notifications
      - [ ] Display
      - [ ] Open
      - [ ] Push Processing
      - [ ] Confirm Deliveries
   - [ ] Outcomes
   - [ ] Sessions
   - [ ] In-App Messaging
   - [ ] REST API requests
   - [ ] Public API changes

# Checklist
## Overview
   - [ ] I have filled out all **REQUIRED** sections above
   - [ ] PR does one thing
     - If it is hard to explain how any codes changes are related to each other then it most likely needs to be more than one PR
   - [ ] Any Public API changes are explained in the PR details and conform to existing APIs

## Testing
   - [ ] I have included test coverage for these changes, or explained why they are not needed
   - [ ] All automated tests pass, or I explained why that is not possible
   - [ ] I have personally tested this on my device, or explained why that is not possible

## Final pass
   - [ ] Code is as readable as possible.
      - Simplify with less code, followed by splitting up code into well named functions and variables, followed by adding comments to the code.
   - [ ] I have reviewed this PR myself, ensuring it meets each checklist item
      - WIP (Work In Progress) is ok, but explain what is still in progress and what you would like feedback on. Start the PR title with "WIP" to indicate this.