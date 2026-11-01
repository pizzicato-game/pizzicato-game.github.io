# Create a Pizzicato study with the visual timeline

For researchers. After the central Firebase setup, you can do everything below in your browser—**no code editing**.

## 1. Sign in

1. Ask the lead researcher for the Pizzicato website address and your credentials.
2. Sign in. Administrators can change studies; moderators can view their assigned study and export results but cannot change study settings.

## 2. Upload levels (optional)

1. Select **Shared level library** in the dashboard.
2. Choose a JSON file exported by the **Pizzicato Level Designer**.
3. Enter a unique ID such as `piano_week1` and a display name.
4. Click **Publish JSON level**.
5. The level is stored in the **central Firebase Realtime Database** and can be selected in any study. Existing published IDs are kept unchanged; upload a changed version with a new ID.

You can also use the seven levels already included in the Pizzicato game; they do not need uploading.

## 3. Design the study as slides

1. Select **Create new study**, or **Edit settings** for an existing one.
2. Choose a Study ID, title, start date, and **maximum sessions per week** (for example, `2`).
3. Under **Visual study timeline**, look at **Week 1**. Each rectangle is one screen the participant will see.
4. Press the buttons under that week to add a **Start screen**, **Play level**, **Break screen**, or **End screen**.
5. Click a rectangle to change its message, or for a level choose an existing/just-uploaded level and set the difficulty (BPM option) and loop count.
6. Drag rectangles left or right to change the order. You can also use the arrow buttons on each rectangle. Drag onto another week to move the slide.
7. Click **+ Add week** to create another horizontal row. Use **+ Pretest** or **+ Posttest** if needed.
8. For a typical week, use **Start → Play level → Break → Play level → End**. The participant must click **Continue** or **Resume Playing** on non-game screens.
9. Check the preview order, then tick **Study enabled** and click **Save study**.

**Important:** The start date determines when Week 1 begins, then Week 2 starts seven days later. If someone reaches their weekly limit, the game shows a comeback message and blocks additional sessions until the next eligible week. Do not change an active study timeline while participants are halfway through a session without first testing the effect on their progress.

## 4. Add participants

1. On the dashboard choose **Participants / results** next to a study.
2. Enter a participant's chosen pseudonymous username, a password of **at least 12 characters**, and optionally their group and start date.
3. Click **Add participant** and share their login securely.
4. To stop a participant signing in, click **Deactivate**. To delete their login, click **Remove login permanently** (previous study results are retained for study export).
5. To get their results, click **Download data** for that participant, or **Export full study** for all results.

## 5. Manage moderators (administrators only)

1. Click **Manage moderator accounts**.
2. Choose which study the moderator should see.
3. Enter a unique moderator username and password of at least 12 characters. Click **Create moderator login**.
4. Use **Disable login**, **Enable login**, **Set new password**, or **Remove moderator** as needed.
5. A moderator cannot add/delete participants or change the study. They can view the roster and download its results.

## 6. Test before inviting participants

1. Create a small **test study** with Start → Level → Break → Level → End and a weekly limit of one session.
2. Add a **test participant** and sign in from a separate private/incognito browser window.
3. Complete both levels and verify that Break and End appear at the right moments.
4. Confirm that the next session is blocked when the weekly limit is reached.
5. Return to the administrator dashboard and download the test participant's results.
6. Confirm that a moderator cannot edit the study. For real research, test local/offline exports separately.

Your custom level library and study settings are shared by any website (local web server or GitHub Pages) pointing at the same Firebase project.
