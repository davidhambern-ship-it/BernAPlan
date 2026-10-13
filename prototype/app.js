
/* BernAPlan Desktop Command Center — zero-dependency, local-first calendar prototype.
 * Stores only on this device. Never claims live external calendar sync.
 */
(()=>{'use strict';
const KEY='bernaplan.desktop.v2.prototype.1';
const DAY_NAMES=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DEFAULT_SLOTS=[{id:'morning',time:'09:00',label:'FOCUS'},{id:'outreach',time:'11:00',label:'ACTION'},{id:'afternoon',time:'14:00',label:'BUILD'},{id:'evening',time:'17:00',label:'PROGRESS'},{id:'night',time:'20:00',label:'REVIEW'}];
const DEFAULT_METRICS=[{id:'focus',name:'Focus hours',target:10,unit:'hours'},{id:'tasks',name:'Completed tasks',target:20,unit:'count'},{id:'wins',name:'Weekly wins',target:5,unit:'count'}];
const DEFAULT_ESSENTIALS=[{id:'review',name:'Review my priorities'},{id:'progress',name:'Make progress on one goal'},{id:'reset',name:'Reflect and reset'}];
const CATALOG={
  everyday:{label:'Everyday Life',description:'An adaptable personal planning week',rows:[['Plan the day','Choose priorities','Organize tasks','Set intentions','Focus on essentials','Personal project','Review the week'],['Respond & organize','Follow up','Personal admin','Appointments','Finish essentials','Home tasks','Plan upcoming week'],['Deep focus','Project progress','Learning time','Creative block','Finish loose ends','Open project time','Prepare for Monday'],['Health & movement','Family & friends','Personal goals','Creative time','Weekly reflection','Free time','Recharge'],['Read & reflect','Evening review','Skill building','Wind down','Celebrate wins','Hobby time','Rest']]},
  business:{label:'Business / Freelance',description:'Client work, delivery, follow-up and business growth',rows:[['Plan priorities','Find opportunities','Research clients','Follow-up review','Pipeline planning','Deep project work','Review goals'],['Client communication','Write proposals','Follow up','Client meeting','Send deliverables','Business admin','Plan next week'],['Project milestone','Portfolio building','Deliver client work','Learning block','Finish priority','Batch project work','Portfolio polish'],['Brand content','Network & connect','Track progress','Brand content','Invoices & finances','Creative development','Rest & ideas'],['Review results','Industry learning','Project planning','Community time','Close out week','Creative time','Weekly reset']]},
  student:{label:'School / Study',description:'Plan studying, assignments and academic goals',rows:[['Plan school week','Review lessons','Read course material','Study session','Weekly quiz','Long study block','Study review'],['Class tasks','Research & notes','Assignment work','Class tasks','Submit coursework','Group project','Plan upcoming week'],['Practice problems','Writing block','Lab / project','Practice problems','Complete assignment','Study difficult topic','Organize materials'],['Movement break','Review flashcards','Academic goals','Read & reflect','Review progress','Personal time','Free time'],['Read & revise','Tomorrow plan','Study review','Reading block','Celebrate progress','Hobby time','Rest']]},
  creator:{label:'Creative / Content',description:'Ideas, making, publishing and creative development',rows:[['Plan content','Explore ideas','Research audience','Refine ideas','Review content','Deep creative work','Review week'],['Draft scripts','Create outline','Record / produce','Edit content','Prepare release','Batch content','Plan next week'],['Design assets','Edit media','Creative build','Postproduction','Complete deliverable','Experiment','Organize portfolio'],['Publish / share','Community replies','Share progress','Publish / share','Review performance','Creative free time','Inspiration time'],['Collect ideas','Practice skills','Creative learning','Organize drafts','Celebrate wins','Creative play','Rest']]},
  blank:{label:'Blank Calendar',description:'Start completely from scratch',rows:[]}
};
const $=s=>document.querySelector(s);const id=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-5);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localDateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const beginningOfWeek=(date=new Date())=>{const d=new Date(date);d.setHours(12,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d};
const fromKey=k=>{const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d,12)};
const addDays=(date,n)=>{const d=new Date(date);d.setDate(d.getDate()+n);return d};
const timeLabel=t=>{let [h,m]=t.split(':').map(Number);return `${h%12||12}${m?':'+String(m).padStart(2,'0'):''} ${h>=12?'PM':'AM'}`};
const safeColor=s=>/^#[0-9a-fA-F]{6}$/.test(s)?s:'#f77513';
const sanitizeImage=s=>typeof s==='string'&&/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s)&&s.length<350000?s:null;
let state,selectedWeek=localDateKey(beginningOfWeek()),activeTask=null,editingTask=false,settingsTab='schedule',toastTimeout;
/* BernAPlan guided playbooks: all local, curated, no API or paid model. */
const GOAL_OPTIONS={
 everyday:['Feel less overwhelmed','Build healthier routines','Finish personal projects','Keep up with responsibilities'],
 business:['Find new clients','Finish client work','Grow my visibility','Get organized'],
 student:['Finish assignments','Prepare for exams','Improve study habits','Manage my school week'],
 creator:['Publish consistently','Finish a creative project','Grow an audience','Organize my ideas'],
 blank:['Start from scratch','Keep my days organized','Follow my goals','Make consistent progress']
};
const OBSTACLE_OPTIONS=[['starting','I don’t know where to begin'],['overwhelm','I have too much to do'],['focus','I get distracted'],['consistency','I have trouble sticking to a plan']];
const PACES=[['light','Light · 2 blocks per day','Room to breathe'],['balanced','Balanced · 3 blocks per day','A manageable rhythm'],['full','Full · 5 blocks per day','A detailed weekly schedule']];
const GUIDES={
 'plan priorities':{
  objective:'Identify the three most important business outcomes for this week, decide what done looks like, and reserve a time for the first action.',
  steps:['Write down every open obligation: client work, deadlines, follow-ups, marketing, and admin. Set a 5-minute timer and do not sort yet.','Put a star beside anything with a real deadline or a significant impact on customers or income. Move tasks that can wait to a Later list.','Choose up to three priorities. For each, replace vague words with a visible outcome (for example, “email the revised design to the client Thursday”).','Break your #1 priority into one action that takes 15–30 minutes. Put that action in an actual time block today.','Check: if these three things were finished, would this week feel successful? If not, revise the list.'],
  tips:['The Eisenhower urgent/important distinction helps separate deadlines from merely loud requests. Important but nonurgent work needs protected time.','Many planners recommend a small number of “most important tasks” rather than an enormous daily list. Three weekly outcomes is a starting point, not a rigid law.','Give priority to commitments you have already made before chasing a new idea. Leave a little buffer for unexpected work.'],
  checklist:['List everything competing for attention','Select three measurable weekly outcomes','Identify one first action for each outcome','Reserve time for priority #1'],
  example:'Instead of “work on website,” write: “Send the client the updated homepage draft by Thursday.” First action: “Open feedback email and make a five-item change list.”',
  success:'You have three clear outcomes, one next action for each, and time booked for the most important one.'
 },
 'find opportunities':{
  objective:'Find a short list of genuine client opportunities that fit the services you can confidently deliver.',
  steps:['Choose one service you offer (for example, website refreshes, video editing, or social graphics).','Search a relevant marketplace, local business directory, or professional group for businesses actively asking for that service.','Check each opportunity: Is the problem clear? Is there a real person or business behind it? Does your work solve it?','Save five promising prospects with their link, contact route, and the specific issue you noticed.'],
  tips:['Relevance matters more than volume. A specific match is stronger than ten random contacts.','Do not lead with a copied sales pitch. First understand what the prospect actually needs.'],
  checklist:['Choose one service','Find five relevant opportunities','Record contact information and needs','Select the best prospect to approach'],
  example:'Business needs a clearer booking page. Save the URL and note “mobile booking button is difficult to find.”',success:'Five real opportunities are documented, and at least one has a clear next step.'
 },
 'research clients':{
  objective:'Understand the needs of three possible clients well enough to propose a relevant improvement.',
  steps:['Choose three businesses from your lead list.','Visit each website or public profile and note what customers can do there.','Identify one specific improvement per business; look for confusing wording, weak mobile layout, outdated imagery, or missing calls to action.','Write a two-sentence personalized observation for each company.'],
  tips:['Use publicly available business information; never assume a business has money or a problem you cannot verify.','Lead with an observation and a useful suggestion, not a long critique.'],
  checklist:['Select three businesses','Identify one concrete issue for each','Write an improvement suggestion','Save notes for outreach'],
  example:'“The salon gallery looks great, but the booking button is hard to find on mobile. A persistent booking link may help visitors act.”',success:'You have three specific, respectful observations ready to use.'
 },
 'follow-up review':{
  objective:'Identify outstanding conversations and choose which contacts need a respectful follow-up.',
  steps:['Open your email, messages, or lead tracker.','List conversations waiting on a reply, approval, quote, or next meeting.','Check the last contact date; do not send repeated messages within an unreasonable period.','Prepare one short follow-up that refers to the previous discussion and offers a clear next step.'],
  tips:['Following up is easier when every contact has a last-contact date and next action.','Give the other person an easy way to decline or choose a time.'],
  checklist:['Review unanswered conversations','Identify follow-ups that are due','Send or schedule appropriate follow-ups','Update next-contact dates'],
  example:'“Just checking whether you had a chance to review the homepage draft. Happy to answer questions or make a small revision.”',success:'Every active conversation has either a next action or a deliberate wait date.'
 },
 'pipeline planning':{
  objective:'Turn unorganized sales leads into a simple pipeline with one next action per prospect.',
  steps:['Put your prospects into four groups: new, contacted, discussing, and won/lost.','Give every active prospect a next action such as “send proposal” or “follow up Friday.”','Choose the three prospects most likely to move forward this week.','Schedule the next actions rather than relying on memory.'],
  tips:['A pipeline is only useful if the next action is current.','Keep opportunity values separate from money you have actually received.'],
  checklist:['Group active prospects by stage','Assign a next action to each','Choose top three opportunities','Schedule their next steps'],success:'You can name the next action for each active prospect.'
 },
 'deep project work':{
  objective:'Finish one meaningful part of a client or personal project without switching between unrelated tasks.',
  steps:['Choose one deliverable you can advance today.','Define a stopping point, such as “complete the first draft of the booking form.”','Gather the files and references you need, then silence avoidable notifications.','Work for one uninterrupted 25–50-minute interval, take a short break, and repeat if needed.','Check the output and document exactly what remains.'],
  tips:['Timeboxing makes large projects less intimidating.','Avoid treating research, drafting, and polishing as the same step. Finish the draft before perfecting details.'],
  checklist:['Select one deliverable','Define the next finished milestone','Complete a focused work interval','Save work and record next action'],success:'One visible project milestone moved forward.'
 },
 'review goals':{
  objective:'Compare what you planned with what actually happened and choose next week’s most valuable adjustment.',
  steps:['Open your weekly scoreboard and completed tasks.','Write down three concrete wins, including small ones.','Check your goals one by one: met, partly met, or missed. Use actual results, not guesses.','Identify one cause of friction and one change to try next week.'],
  tips:['Review the process as well as results: a missed target can reveal an unrealistic schedule.','Avoid judging the week by busyness alone; look for finished outcomes.'],
  checklist:['Record actual results','Write three wins','Review missed targets without guessing','Choose one improvement'],success:'Your next week has one evidence-based adjustment.'
 },
 'client communication':{
  objective:'Respond to active clients clearly and prevent open questions from delaying project delivery.',
  steps:['Gather client conversations in one place.','Flag anything that needs a decision, approval, status update, or promised reply.','Answer urgent commitments first; for each message state what happened, what comes next, and when.','Record any new deadline or action in your calendar.'],
  tips:['Clear messages reduce follow-up questions. Use short paragraphs and specific dates.','Never promise a delivery date you have not checked against your schedule.'],
  checklist:['Review client messages','Respond to time-sensitive needs','Confirm next steps and dates','Add resulting tasks to the plan'],success:'Important client conversations have clear next steps.'
 },
 'write proposals':{
  objective:'Create and send a relevant proposal that states the client’s problem, your solution, scope, timeline, and price.',
  steps:['Choose a real opportunity where you understand the customer’s needs.','Write one sentence describing the problem in the client’s own terms.','Outline the deliverables, what is not included, a realistic timeline, and payment terms.','Explain your approach in plain language and add a clear invitation to accept or ask questions.','Proofread names, links, and dates before sending.'],
  tips:['A useful proposal makes scope and next steps unambiguous.','Avoid padding it with jargon or promising results you cannot guarantee.'],
  checklist:['Confirm the client need','Define scope and deliverables','Set timeline and price','Proofread and send'],success:'A clear, accurate proposal is ready or has been sent.'
 },
 'follow up':{
  objective:'Move one open professional conversation forward with a timely and helpful follow-up.',
  steps:['Select a conversation with an agreed or reasonable follow-up date.','Reread the last message so your follow-up refers to a real need.','Write two or three sentences: context, a useful update or question, and one easy next step.','Send once, record the date, and choose when to check again.'],
  tips:['A brief specific follow-up is easier to answer than “just checking in” without context.','Respect requests not to be contacted.'],
  checklist:['Choose a due conversation','Write a context-specific follow-up','Send and record it','Schedule a reasonable next check'],success:'The contact has received a helpful message and your tracker is current.'
 },
 'client meeting':{
  objective:'Enter the meeting with a clear outcome and leave with documented decisions, owners, and dates.',
  steps:['Before the meeting, choose one decision or result you need.','Prepare a short agenda, relevant links, and two questions that require an answer.','During the call, confirm what each person agrees to do.','Afterward, send a brief recap of decisions and deadlines and update your command center.'],
  tips:['An agenda and decision log prevent meetings from turning into vague conversations.','If a decision is blocked, record who will provide the missing information.'],
  checklist:['Define the meeting goal','Prepare agenda and questions','Capture decisions and owners','Send recap and add follow-ups'],success:'You know the decisions, owners, and next dates.'
 },
 'send deliverables':{
  objective:'Deliver the promised files or work to the client with clear instructions for review and approval.',
  steps:['Compare the deliverable against what was agreed.','Open or test the final file, link, or page yourself.','Package the files with readable names and appropriate access permissions.','Send a short note describing what is included, how to review it, and when feedback is needed.'],
  tips:['Check links in a private window where possible; access errors can delay approval.','Separate what is final from what still needs review.'],
  checklist:['Check agreed scope','Test final files or links','Send with review instructions','Record delivery date and next step'],success:'The client can open the work and knows how to respond.'
 },
 'business admin':{
  objective:'Clear the operational tasks that would otherwise create missed payments, deadlines, or confusion.',
  steps:['Check upcoming due dates, invoices, receipts, and commitments.','Pick the items with deadlines or financial consequences first.','Complete or schedule each item, keeping private data in a secure location.','Record anything unfinished with a clear next date.'],
  tips:['Batch admin into a defined block so it does not interrupt creative work throughout the day.','Keep financial records and passwords out of public planning notes.'],
  checklist:['Review due items','Handle urgent admin work','Organize records safely','Schedule remaining actions'],success:'Urgent admin is handled and everything else has a next date.'
 },
 'plan next week':{
  objective:'Prepare the next seven days with three important outcomes and realistic time blocks.',
  steps:['Review this week’s unfinished commitments and actual results.','Choose three outcomes that matter for the upcoming week.','Place appointments and fixed deadlines first, then reserve focus time.','Leave open space for surprises and check whether the workload is realistic.'],
  tips:['Plan around real constraints rather than assuming every hour is available.','Carry forward unfinished work only if it still matters.'],
  checklist:['Review unfinished work','Pick three goals','Place deadlines and focus blocks','Check that the schedule is realistic'],success:'Next week starts with clear priorities and enough available time.'
 },
 'project milestone':{
  objective:'Finish one defined project milestone that someone else can review or you can objectively verify.',
  steps:['Open the project scope and find the next unfinished milestone.','Write an acceptance check: what will be true when this part is done?','Finish the smallest piece that meets the check.','Test the result and document anything preventing completion.'],
  tips:['Break large deliverables into independently testable chunks.','Avoid moving to the next milestone before checking the current one.'],
  checklist:['Define milestone acceptance check','Complete the milestone','Test or review it','Log next action'],success:'A testable milestone is complete or a specific blocker is documented.'
 },
 'portfolio building':{
  objective:'Create one strong example that demonstrates a specific service or skill to a future customer.',
  steps:['Pick the service you want to demonstrate.','Choose an appropriate sample or permitted project; never publish confidential client materials.','Show the problem, your process, and the improved result.','Publish the finished piece with a short explanation and an easy contact link.'],
  tips:['One clear case study is often more convincing than many unexplained images.','Describe your contribution honestly; identify concept/spec work as such.'],
  checklist:['Choose skill to demonstrate','Build or select sample','Explain problem and result','Publish with accurate attribution'],success:'One portfolio piece clearly demonstrates what you can do.'
 },
 'deliver client work':{
  objective:'Advance the client deliverable toward its agreed acceptance criteria without adding unapproved scope.',
  steps:['Reopen the agreement or latest feedback.','Identify the highest-impact remaining task within scope.','Complete it, then test or proofread the result.','Update the client if a milestone is reached or a blocker changes the delivery date.'],
  tips:['Validate against the agreement, not just your own idea of “finished.”','Record scope changes before investing time in them.'],
  checklist:['Check current scope','Complete highest-priority change','Review/test output','Update status or send result'],success:'The deliverable is closer to approved completion, with status recorded.'
 },
 'brand content':{
  objective:'Publish one useful, on-brand piece of content aimed at the audience you want to serve.',
  steps:['Choose one audience question or common mistake relevant to your work.','Write a helpful takeaway or show a real process example.','Create a concise visual, clip, or post with a clear caption.','Check accessibility and accuracy, publish, and note what you learned.'],
  tips:['Value-first content is more useful than repeated “hire me” promotions.','Keep visuals consistent and ask for only one action at a time.'],
  checklist:['Choose audience problem','Create useful content','Check and publish','Record response or lesson'],success:'One useful piece of brand content is published or ready.'
 },
 'network & connect':{
  objective:'Start authentic conversations with people who share your professional interests or may benefit from your expertise.',
  steps:['Identify three relevant people or communities.','Read something they recently shared or worked on.','Leave one thoughtful comment or send a short personalized introduction.','Record conversations worth following up without immediately pushing a sale.'],
  tips:['Build relationships before making requests.','Avoid mass unsolicited messages and generic praise.'],
  checklist:['Identify three relevant contacts','Learn about their work','Send thoughtful outreach','Record real conversations'],success:'You made meaningful connections and know which to continue.'
 },
 'track progress':{
  objective:'Update your scoreboard with real numbers so you can see whether your activities are producing results.',
  steps:['Open your lead list, completed tasks, invoices, and messages.','Count actual actions and results for each metric; do not guess.','Use “Log a result” for the appropriate metric.','Compare against your targets and choose one thing to adjust.'],
  tips:['Keep activity numbers (messages sent) separate from outcome numbers (customers gained).','Track the same definition of a metric each week to make comparisons useful.'],
  checklist:['Gather source records','Enter real results','Compare to goals','Choose an adjustment'],success:'Your scoreboard reflects documented activity and results.'
 },
 'invoices & finances':{
  objective:'Confirm invoices, amounts due, and payments so no important financial follow-up is missed.',
  steps:['Open your existing invoice or bookkeeping records.','Check sent invoices for correct client, amount, due date, and status.','Send due or overdue reminders politely when appropriate.','Record actual payments received separately from expected payments.'],
  tips:['Never count a quoted project as paid revenue.','Keep private billing details in secure finance tools, not public desktop notes.'],
  checklist:['Review invoice statuses','Send or follow up on due items','Log actual payments received','Schedule any remaining action'],success:'Your invoice statuses and next actions are current.'
 },
 'industry learning':{
  objective:'Learn one practical idea you can apply to a service you currently offer.',
  steps:['Identify one skill gap that slowed your current work.','Choose a trusted free tutorial or documentation page about that exact topic.','Practice the idea in a small test rather than watching passively.','Save one lesson and one situation where you will apply it.'],
  tips:['Learning is most valuable when you use the skill soon after studying.','Prefer source documentation and hands-on practice over collecting endless tutorials.'],
  checklist:['Choose a specific skill','Use a free resource','Practice once','Record an application'],success:'You practiced a usable skill and know where to apply it.'
 },
 'plan the day':{
  objective:'Pick one must-do task and two helpful tasks, then put them in a realistic order for today.',
  steps:['Look at your fixed appointments and remaining free time.','Write down everything on your mind for two minutes.','Select one must-do and no more than two bonus tasks.','Break the must-do into one action you can start in ten minutes.'],
  tips:['Prioritize outcomes, not how long a list looks.','Leave room for rest and unexpected responsibilities.'],
  checklist:['Check real commitments','Choose one must-do outcome','Choose two optional tasks','Schedule first action'],success:'You know exactly what to start and what can wait.'
 },
 'choose priorities':{
  objective:'Separate today’s essential responsibilities from optional work and choose your first action.',
  steps:['List your responsibilities without sorting.','Mark what has a genuine deadline or meaningful consequence.','Choose one top priority and two secondary items.','Write a first action with a verb and an object: “call the clinic,” not “health.”'],
  tips:['Urgent does not always mean important; assess both.','Limit work in progress to reduce unfinished tasks.'],
  checklist:['Write task list','Mark essential items','Choose top three','Name first concrete action'],success:'Your top priority and first step are unambiguous.'
 },
 'plan school week':{
  objective:'Organize assignments, due dates, and study blocks so important schoolwork has enough time.',
  steps:['Open every course page or syllabus and copy upcoming deadlines.','Mark assessments, long assignments, and anything due within seven days.','Estimate work time and split larger assignments into research, drafting, and review blocks.','Place study sessions before deadlines and save one buffer slot.'],
  tips:['Starting before the due date reduces last-minute surprises.','Use short recurring review sessions rather than a single cram block.'],
  checklist:['Collect course deadlines','Rank urgent and high-impact work','Break down large assignments','Reserve study time'],success:'Each upcoming assignment has a due date and a planned work slot.'
 },
 'study session':{
  objective:'Learn and recall one clearly defined topic rather than passively rereading for the entire block.',
  steps:['Choose the exact chapter, concept, or problem type to study.','Spend 10–15 minutes explaining what you know without looking at notes.','Check the material and correct your gaps.','Solve a few practice questions or teach the topic out loud.'],
  tips:['Active recall and retrieval practice are generally more useful for memory than rereading alone.','Short breaks can help maintain attention during longer study sessions.'],
  checklist:['Choose one topic','Attempt recall without notes','Correct weak spots','Practice with questions'],success:'You can explain the topic or solve representative questions with fewer gaps.'
 },
 'assignment work':{
  objective:'Move one assignment to a visible milestone before its due date.',
  steps:['Read the rubric and instructions carefully.','Identify what the finished submission must include.','Choose the next milestone: outline, draft, calculations, or revisions.','Complete the milestone, check it against the rubric, and save it.'],
  tips:['Use the grading criteria as a checklist.','Ask questions early when instructions are unclear.'],
  checklist:['Review rubric','Define next milestone','Work on milestone','Save and verify progress'],success:'One identifiable part of the assignment is complete.'
 },
 'prepare for exams':{
  objective:'Identify weak topics and practice recalling or applying them before the exam.',
  steps:['List topics from the syllabus or study guide.','Test yourself briefly without notes to identify gaps.','Choose two weak areas and review worked examples.','Retest and note which topics need another session.'],
  tips:['Mix practice and spaced review over several days rather than cramming once.','Practice in a format similar to the exam when possible.'],
  checklist:['List exam topics','Identify weak areas','Practice two areas','Schedule next review'],success:'You have identified gaps and made a repeatable review plan.'
 },
 'plan content':{
  objective:'Choose a clear audience, one topic, and a publishable outcome for this week.',
  steps:['Decide who one piece of content is for.','List three questions that audience cares about.','Pick one question and one format: short video, image, or written post.','Write the key takeaway and put creation and review on the calendar.'],
  tips:['Create for a specific audience problem rather than posting just to fill a slot.','Keep each piece focused on one message.'],
  checklist:['Identify audience','Choose a useful topic','Select format and message','Schedule production'],success:'You have an audience-focused topic and a time to make it.'
 },
 'draft scripts':{
  objective:'Create a short script with a clear opening, useful middle, and one ending action.',
  steps:['Write the audience and main takeaway at the top.','Draft a one-sentence hook explaining why the viewer should care.','Outline two or three supporting points and any visual examples.','Read it aloud, remove unnecessary words, and write a clear ending.'],
  tips:['Read scripts aloud to catch unnatural phrasing.','Aim for one message per short-form video.'],
  checklist:['Define main takeaway','Write opening hook','Draft body and examples','Read aloud and revise'],success:'You have a script you can read smoothly and record.'
 },
 'record / produce':{
  objective:'Capture the footage, audio, or creative assets needed to finish one defined piece of content.',
  steps:['Open your script or shot list.','Check microphone, lighting, framing, and storage with a short test.','Capture the required takes or source materials.','Review one sample to verify audio and image quality before packing away.'],
  tips:['A short equipment test saves the time of redoing an entire recording.','Record optional extra takes only after the required material is safe.'],
  checklist:['Prepare shot list','Check audio and framing','Capture required material','Verify and back up files'],success:'Usable source material exists and is saved.'
 },
 'publish / share':{
  objective:'Publish one complete piece of content with accurate details and a clear purpose.',
  steps:['Check the final media or text from start to finish.','Confirm title, caption, links, platform dimensions, and any necessary permissions.','Publish or schedule the item on the intended platform.','Save the link and note one thing to review later.'],
  tips:['Quality-control before publishing prevents avoidable corrections.','Do not judge performance immediately; choose a sensible review interval.'],
  checklist:['Review finished asset','Check metadata and links','Publish or schedule','Save publication link'],success:'Content is live or scheduled, and you have its link.'
 },
 'review performance':{
  objective:'Identify what actually worked in recent content and one test to run next.',
  steps:['Choose a recent set of comparable posts.','Read actual reach, completion, saves, or other relevant metrics.','Note which message or format earned meaningful engagement.','Choose one small change to test on the next piece.'],
  tips:['Compare similar time periods and formats when drawing conclusions.','Avoid making decisions from one unusually strong or weak post.'],
  checklist:['Collect actual metrics','Spot one pattern','Choose one next experiment','Record the result'],success:'You have a data-informed change to test.'
 }
};
const CARD_RECIPES={"plan the day":{"action":"Check appointments and deadlines; choose your top 3 actions.","target":"3 priorities + first action"},"choose priorities":{"action":"List open tasks; pick the 3 with the biggest impact.","target":"3 ranked priorities"},"organize tasks":{"action":"Sort your task list into Today, This Week, and Later.","target":"3 clear task lists"},"set intentions":{"action":"Choose 1 important outcome and block time to start it.","target":"1 outcome + start time"},"focus on essentials":{"action":"Finish the most urgent unfinished responsibility first.","target":"1 essential finished"},"personal project":{"action":"Open your personal project; finish 1 small milestone.","target":"1 visible milestone"},"review the week":{"action":"Check completed work, delays, and next commitments.","target":"3 wins + 1 improvement"},"respond & organize":{"action":"Answer 3 important messages; note the next actions.","target":"3 replies processed"},"follow up":{"action":"Message 2 people waiting on an answer or update.","target":"2 follow-ups sent"},"personal admin":{"action":"Pay, file, or schedule 1 overdue household item.","target":"1 admin item closed"},"appointments":{"action":"Check upcoming appointments; confirm time and location.","target":"Next appointments confirmed"},"finish essentials":{"action":"Complete 1 must-do task before starting something new.","target":"1 must-do finished"},"home tasks":{"action":"Pick 1 room; tidy for 20 minutes and put items away.","target":"20 minutes of tidying"},"plan upcoming week":{"action":"Check commitments; choose 3 priorities for next week.","target":"3 priorities scheduled"},"deep focus":{"action":"Choose 1 project step; work without notifications for 25 min.","target":"25-minute focus session"},"project progress":{"action":"Make and save 1 visible improvement to your project.","target":"1 saved improvement"},"learning time":{"action":"Study 1 topic; test yourself with 3 questions.","target":"1 topic + 3 answers"},"creative block":{"action":"Make 1 sketch, paragraph, or draft for a personal idea.","target":"1 rough draft"},"finish loose ends":{"action":"Close 2 small tasks that have been waiting.","target":"2 loose ends closed"},"open project time":{"action":"Work on the personal project that matters most today.","target":"1 completed next step"},"prepare for monday":{"action":"Pack, plan, or set out what tomorrow needs.","target":"3 things ready"},"health & movement":{"action":"Walk, stretch, or exercise at a comfortable pace.","target":"20 minutes of movement"},"family & friends":{"action":"Call or message someone important; listen and reconnect.","target":"1 meaningful conversation"},"personal goals":{"action":"Break 1 long-term goal into a step for this week.","target":"1 next step scheduled"},"creative time":{"action":"Spend 30 minutes making something you enjoy.","target":"30 creative minutes"},"weekly reflection":{"action":"Write 2 successes and 1 thing to change next week.","target":"2 wins + 1 change"},"free time":{"action":"Take a guilt-free break with no work obligations.","target":"30 minutes for yourself"},"recharge":{"action":"Rest, unplug, or take a calming walk.","target":"30 minutes of recovery"},"read & reflect":{"action":"Read for 20 minutes; note 1 idea worth keeping.","target":"20 minutes + 1 insight"},"evening review":{"action":"Mark today's actual results; choose tomorrow's first task.","target":"1 result + tomorrow's start"},"skill building":{"action":"Practice 1 useful skill with a hands-on exercise.","target":"1 completed exercise"},"wind down":{"action":"Put screens aside and prepare for restful sleep.","target":"30 minutes of quiet"},"celebrate wins":{"action":"Write 3 things you followed through on this week.","target":"3 genuine wins noted"},"hobby time":{"action":"Do an enjoyable hobby without a productivity goal.","target":"30 minutes of hobby time"},"rest":{"action":"Protect a real rest period; leave work unfinished if needed.","target":"Rest—no proof required"},"plan priorities":{"action":"List current jobs and deadlines; rank the top 3 outcomes.","target":"3 priorities + first action"},"find opportunities":{"action":"Check Upwork, Contra, LinkedIn Services or local listings.","target":"Save 10 fitting opportunities"},"research clients":{"action":"Review 3 potential clients' sites; note 1 need for each.","target":"3 client audit notes"},"follow-up review":{"action":"Check sent proposals and replies; identify who needs a nudge.","target":"5 follow-ups identified"},"pipeline planning":{"action":"Review lead stages; choose who to contact next.","target":"Top 5 leads prioritized"},"deep project work":{"action":"Work uninterrupted on the most urgent client deliverable.","target":"1 finished project section"},"review goals":{"action":"Compare client, sales and delivery results against targets.","target":"3 results + next priority"},"client communication":{"action":"Send 3 clear updates or replies to active clients.","target":"3 client messages sent"},"write proposals":{"action":"Draft 2 tailored proposals with scope, price and next step.","target":"2 proposals drafted"},"client meeting":{"action":"Prepare agenda and questions; confirm the next client meeting.","target":"1 meeting agenda ready"},"send deliverables":{"action":"Quality-check and send a finished item to a client.","target":"1 deliverable sent"},"business admin":{"action":"Update invoices, expenses and upcoming due dates.","target":"3 records updated"},"plan next week":{"action":"Choose 3 revenue or delivery priorities; block calendar time.","target":"3 goals scheduled"},"project milestone":{"action":"Complete 1 clearly defined piece of client work.","target":"1 milestone finished"},"portfolio building":{"action":"Create 1 sample or case study showing your work.","target":"1 portfolio piece drafted"},"deliver client work":{"action":"Finish and share 1 approved client deliverable.","target":"1 approved item delivered"},"learning block":{"action":"Study 1 skill needed for current client work; practice it.","target":"1 hands-on practice task"},"finish priority":{"action":"Close the highest-impact open business task.","target":"1 priority finished"},"batch project work":{"action":"Process 2 similar client tasks without switching projects.","target":"2 items completed"},"portfolio polish":{"action":"Improve 1 portfolio project's images, copy or proof.","target":"1 case study improved"},"brand content":{"action":"Publish 1 case study, tip, breakdown or behind-the-scenes post.","target":"1 useful post published"},"network & connect":{"action":"Reach out to 3 relevant contacts with a personal message.","target":"3 genuine connections"},"track progress":{"action":"Update lead, proposal, delivery and revenue numbers.","target":"4 metrics recorded"},"invoices & finances":{"action":"Check unpaid invoices; update the ledger and follow up.","target":"1 invoice or ledger update"},"creative development":{"action":"Build 1 sample ad, design or offer for your services.","target":"1 finished concept"},"rest & ideas":{"action":"Take a low-pressure break; capture any useful ideas.","target":"Rest + optional idea"},"review results":{"action":"Compare leads, replies, sales and delivery against the plan.","target":"3 results + 1 adjustment"},"industry learning":{"action":"Read 1 industry resource; test a practical takeaway.","target":"1 applied takeaway"},"project planning":{"action":"Break the next client project into 3 ordered milestones.","target":"3 milestones with dates"},"community time":{"action":"Join 1 relevant community discussion; contribute helpfully.","target":"1 meaningful contribution"},"close out week":{"action":"Send final updates, log results, and identify carryovers.","target":"1 weekly closeout note"},"weekly reset":{"action":"Archive finished work; set the next most important action.","target":"1 clean handoff"},"plan school week":{"action":"Check class deadlines and choose your top 3 school tasks.","target":"3 school priorities"},"review lessons":{"action":"Reread class notes; recall 5 key ideas without looking.","target":"5 ideas recalled"},"read course material":{"action":"Read the assigned section; write a short summary.","target":"1 section + 5 bullet summary"},"study session":{"action":"Review 1 difficult topic; answer 5 practice questions.","target":"5 answers + corrections"},"weekly quiz":{"action":"Take a self-quiz, then review every missed answer.","target":"1 quiz + corrected mistakes"},"long study block":{"action":"Work 45 minutes on the toughest upcoming subject.","target":"45 minutes + 1 output"},"study review":{"action":"Check this week's assignments; note gaps for next week.","target":"1 gap list + next action"},"class tasks":{"action":"Check the course portal; complete the nearest small task.","target":"1 class task submitted"},"research & notes":{"action":"Find 2 reliable sources; record 3 useful notes.","target":"2 sources + 3 notes"},"assignment work":{"action":"Complete 1 section of the next assignment and save it.","target":"1 assignment section"},"submit coursework":{"action":"Review the rubric, upload finished work and confirm receipt.","target":"1 submission confirmed"},"group project":{"action":"Contact your team; agree on tasks and the next deadline.","target":"1 assigned next step"},"practice problems":{"action":"Solve 5 problems; review the ones you missed.","target":"5 attempted problems"},"writing block":{"action":"Outline or draft 300 words for the next written task.","target":"300 useful words"},"lab / project":{"action":"Complete 1 experiment, coding step or project milestone.","target":"1 lab/project step"},"complete assignment":{"action":"Finish and check 1 task against the assignment rubric.","target":"1 checked deliverable"},"study difficult topic":{"action":"Review 1 confusing concept; teach it back in your words.","target":"1 explain-back summary"},"organize materials":{"action":"File notes and downloads by class; clear the study area.","target":"1 organized class folder"},"movement break":{"action":"Walk or stretch away from your study screen.","target":"15-minute active break"},"review flashcards":{"action":"Practice 20 cards; repeat those you missed.","target":"20 cards reviewed"},"academic goals":{"action":"Choose 1 course improvement; plan 2 actions toward it.","target":"1 goal + 2 actions"},"review progress":{"action":"Check upcoming grades and deadlines; choose next focus.","target":"1 updated study plan"},"personal time":{"action":"Enjoy an activity unrelated to class or deadlines.","target":"30 minutes personal time"},"read & revise":{"action":"Reread 1 passage or draft; make 3 targeted improvements.","target":"3 useful revisions"},"tomorrow plan":{"action":"Check tomorrow's classes; prepare materials and first task.","target":"1 ready-for-tomorrow list"},"reading block":{"action":"Read for 25 minutes; write 3 questions or notes.","target":"25 minutes + 3 notes"},"celebrate progress":{"action":"Name 3 study efforts that helped, even if unfinished.","target":"3 honest wins"},"prepare for exams":{"action":"List exam topics; practice 10 questions on a weak subject.","target":"10 questions checked"},"plan content":{"action":"Choose 3 post topics; match each to an audience need.","target":"3 post ideas + hook"},"explore ideas":{"action":"Review audience comments and trends; save 5 ideas.","target":"5 ideas with context"},"research audience":{"action":"Read 10 comments or questions in your niche; note patterns.","target":"3 recurring audience needs"},"refine ideas":{"action":"Pick 1 idea; write its hook, promise and call to action.","target":"1 production-ready concept"},"review content":{"action":"Study 3 recent posts; record which hooks worked best.","target":"3 post observations"},"deep creative work":{"action":"Create the most important unfinished section of a project.","target":"1 saved deliverable section"},"review week":{"action":"Check published posts, unfinished drafts and next deadlines.","target":"3 results + next goal"},"draft scripts":{"action":"Write 1 short script with hook, main point and CTA.","target":"1 complete short script"},"create outline":{"action":"Outline 1 piece with opening, three beats and ending.","target":"1 structured outline"},"record / produce":{"action":"Record 1 usable video or audio segment; label the files.","target":"1 usable recording"},"edit content":{"action":"Cut, caption and export 1 publish-ready short video.","target":"1 exported edit"},"prepare release":{"action":"Check artwork, title, captions and publish date.","target":"1 release checklist complete"},"batch content":{"action":"Produce or schedule 3 posts while assets are open.","target":"3 posts prepared"},"design assets":{"action":"Create 1 cover, thumbnail or graphic for a planned post.","target":"1 usable design asset"},"edit media":{"action":"Trim and caption 1 piece of media for its platform.","target":"1 edited media file"},"creative build":{"action":"Finish 1 concrete component of your current project.","target":"1 saved component"},"postproduction":{"action":"Check audio, captions, transitions and export settings.","target":"1 checked final export"},"complete deliverable":{"action":"Finish and package 1 asset ready to send or publish.","target":"1 ready-to-share asset"},"experiment":{"action":"Try 1 new technique and save the best test.","target":"1 saved experiment"},"organize portfolio":{"action":"Select 3 strong samples; improve one presentation.","target":"3 samples + 1 update"},"publish / share":{"action":"Publish 1 ready piece; add a caption and invitation to respond.","target":"1 published piece"},"community replies":{"action":"Reply thoughtfully to 5 comments or questions.","target":"5 useful replies"},"share progress":{"action":"Show 1 work-in-progress update with what changed.","target":"1 progress update"},"review performance":{"action":"Check reach, saves and responses for 3 posts.","target":"3 metrics + 1 lesson"},"creative free time":{"action":"Create without a deadline; save any idea you like.","target":"30 minutes of play"},"inspiration time":{"action":"Review 3 inspiring works; note a technique to try.","target":"3 references + 1 idea"},"collect ideas":{"action":"Capture 5 prompts from your notes, audience or surroundings.","target":"5 categorized ideas"},"practice skills":{"action":"Practice one editing, writing or design technique 20 min.","target":"1 completed skill drill"},"creative learning":{"action":"Follow 1 tutorial; reproduce its result yourself.","target":"1 recreated example"},"organize drafts":{"action":"Sort drafts into Ready, Needs Work and Later.","target":"3 sorted draft groups"},"creative play":{"action":"Make 1 low-stakes sketch, sound or layout experiment.","target":"1 playful experiment"}};
function cardRecipe(title){return CARD_RECIPES[String(title||'').toLowerCase().trim()]||null;}
function isAutoGeneratedTask(t){return t&&t.guided===true&&t.kind==='task';}
function personalizeCalendarTask(t){
 const recipe=cardRecipe(t.title);if(!recipe)return false;
 let changed=false;
 const old=String(t.description||'');
 // Only replace the generic descriptions emitted by prior versions. User-edited text stays untouched.
 const wasBoilerplate=!old||old===t.success||old===t.objective||/^You can point to one /i.test(old)||/^You have one /i.test(old)||/^Make meaningful progress on /i.test(old);
 if(wasBoilerplate&&old!==recipe.action){t.description=recipe.action;changed=true;}
 if(!t.target){t.target=recipe.target;changed=true;}
 return changed;
}
function supportBlock(template,day,row){
 const d=DAY_NAMES[day];
 const options={
  everyday:[['Inbox reset','Sort 5 messages or notes; save the 1 action that matters.','5 items sorted'],['Break & recharge','Take a real break, stretch or enjoy a quiet moment.','20-minute break'],['Catch-up window','Finish 1 small unfinished responsibility, or rest if caught up.','1 item or planned rest']],
  business:[['Client inbox check','Reply to 2 client messages; note any real deadlines.','2 client replies'],['Business buffer','Finish 1 loose end or take a planned work break.','1 loose end or break'],['File & follow-up','Save today’s work and schedule 1 next client action.','1 saved next action']],
  student:[['Class inbox check','Check the class portal and note the next due assignment.','1 deadline captured'],['Study break','Step away from screens and recharge before the next topic.','15-minute break'],['School catch-up','Finish 1 small course requirement or review notes.','1 task or notes review']],
  creator:[['Comments & messages','Reply to 3 audience questions or creative collaborators.','3 useful replies'],['Creative reset','Take a screen break and save one fresh thought if inspired.','20-minute reset'],['Asset tidy-up','Name and file 3 project assets so you can find them.','3 organized files']]
 };
 const rowMap={1:0,3:1,4:2,2:2,0:0};
 const choices=options[template]||options.everyday;
 return choices[rowMap[row]];
}
function upgradeGeneratedCalendar(){
 // Older light/balanced setups only generated 14 or 21 cards, leaving visually empty 11/5 rows.
 // Fill only untouched template-shaped plans, once; never overwrite user-created plans.
 const pace=state.profile.guidance?.pace;
 const template=state.profile.template;
 const expected=pace==='light'?14:pace==='balanced'?21:null;
 const nativeRows=pace==='light'?[0,2]:pace==='balanced'?[0,2,4]:null;
 let changes=0;
 if(expected&&state.tasks.length===expected&&state.tasks.every(t=>isAutoGeneratedTask(t)&&nativeRows.includes(t.slot))){
  const used=new Set(state.tasks.map(t=>`${t.day}:${t.slot}`));
  for(let row=0;row<5;row++)for(let day=0;day<7;day++){
   if(used.has(`${day}:${row}`))continue;
   const [title,action,target]=supportBlock(template,day,row);
   const t=createTask(day,row,title,action),g=guidanceFor(title,template,state.profile.guidance||{});
   Object.assign(t,{description:action,target,objective:action+' Result: '+target+'.',instructions:[`Start with: ${action}`,`Complete or check: ${target}.`,'Note what happened; if this was a rest block, simply take the break.'],tips:g.tips,checklist:[`Start: ${title}`,`Finish: ${target}`],success:target,guided:true,support:true});
   state.tasks.push(t);changes++;
  }
 }
 for(const t of state.tasks)if(isAutoGeneratedTask(t)&&personalizeCalendarTask(t))changes++;
 return changes;
}

function guidanceFor(title,template,preferences={}){
 const key=String(title||'').trim().toLowerCase();
 let g=GUIDES[key];
 // Related titles receive a relevant curated process, not the same generic three-step placeholder.
 if(!g){
  const domain=template==='student'?'course or assignment':template==='creator'?'piece of content':template==='business'?'client or business outcome':'personal responsibility';
  let p;
  if(/review|reflect|reset|celebrat|close out/i.test(key))p=['Review what happened','Look at completed work and any real results.','Name what worked, where you got stuck, and why.','Choose one useful adjustment and put its first step on the calendar.','Compare outcomes to goals instead of measuring only busyness.'];
  else if(/plan|organize|outline|intentions|prepare/i.test(key))p=['Turn an idea into a manageable plan','List what must happen and any real due date.','Choose the most important result and break it into small actions.','Reserve a calendar block for the very first action.','Keep the plan realistic; fewer priorities are easier to finish.'];
  else if(/learn|study|read|practice|quiz|flashcard|lesson|research|skill/i.test(key))p=['Learn one useful thing','Pick one precise question or concept.','Read a reliable resource, then test your understanding without looking.','Apply the idea in a tiny exercise and note what you still need to learn.','Testing yourself is more informative than rereading without checking recall.'];
  else if(/edit|finish|complete|polish|deliver|milestone|build|create|project|design|media|production|draft|writing|assignment|lab/i.test(key))p=['Finish a visible piece of work','Define the smallest finished result for this block.','Gather the files and remove avoidable distractions.','Work, check the result against the requirements, and record the next change.','Separate creating a first version from polishing it.'];
  else if(/communicat|respond|follow|repl|community|network|share|publish|post/i.test(key))p=['Communicate with purpose','Choose the person or audience and the specific outcome.','Write or prepare a useful, context-aware message.','Send or publish it, then record the next follow-up or review date.','Keep messages specific and easy to respond to.'];
  else if(/health|movement|rest|recharge|wind down|family|friends|personal time|free time|hobby/i.test(key))p=['Protect time for wellbeing','Pick a realistic activity that fits your energy and schedule.','Prepare anything you need to start without friction.','Do the activity, then decide whether to repeat it next week.','Rest is part of sustainable productivity; do not turn every break into a target.'];
  else p=['Complete one useful outcome','Name a specific result for this block.','Choose the smallest first action that moves toward it.','Complete that action and note what changed.','Choose a result you can observe, not just an intention.'];
  const r=cardRecipe(title);
  g=r?{objective:`${r.action} Aim for: ${r.target}.`,steps:[`Get started: ${r.action}`,`Work toward this result: ${r.target}.`,'Check what actually happened, record the result, and choose a next action if anything remains.'],tips:[p[4],'Start with a small first action rather than waiting for motivation.'],checklist:[`Begin: ${title}`,`Complete: ${r.target}`, 'Write down the actual result'],example:`A successful block has this outcome: ${r.target}.`,success:r.target}
  :{objective:`Use this block to ${key} and make measurable progress on your ${domain}.`,steps:[p[1],p[2],p[3]],tips:[p[4],'If you get stuck, reduce the first action to something you can do in ten minutes.'],checklist:[`Choose a specific outcome for ${title}`,`Complete the main ${title.toLowerCase()} action`,`Record what changed and what comes next`],example:`For “${title}”: choose one result you can point to afterward rather than simply spending time on the activity.`,success:`You can point to one concrete result from ${title.toLowerCase()}.`};
 }
 const result=structuredClone(g);
 const goal=preferences.goal||'';
 const obstacle=preferences.obstacle||'';
 if(goal&&preferences.personalize!==false){result.personalFocus=`Your current goal: ${goal}. Choose examples that help this goal, but keep real deadlines and commitments first.`;}
 if(obstacle==='starting')result.tips.push('Having trouble starting? Do only the first checklist item. You can decide the rest after that.');
 if(obstacle==='overwhelm')result.tips.push('Feeling overloaded? Pick your one most important outcome and move lower-impact items to Later.');
 if(obstacle==='focus')result.tips.push('If distractions interrupt you, try a 20-minute notification-free work interval.');
 if(obstacle==='consistency')result.tips.push('Aim for repeatable progress, not perfect days. Carry a missed block into the next available slot.');
 return result;
}
function improveGuideIfGeneric(task){
 const isDefault=String(task.objective||'')===`Make meaningful progress on ${String(task.title||'').toLowerCase()}.`&&Array.isArray(task.instructions)&&task.instructions.length===3&&task.instructions[0]==='Define the specific result you want by the end of the block.';
 if(!isDefault)return false;
 const g=guidanceFor(task.title,state.profile.template,{...state.profile.guidance,personalize:true});
 Object.assign(task,{objective:g.objective,instructions:g.steps,tips:g.tips,checklist:g.checklist,example:g.example,success:g.success,personalFocus:g.personalFocus||'',guided:true});
 return true;
}

function defaultState(){return {version:1,configured:false,profile:{name:'My Command Center',template:'everyday',accent:'#f77513',background:'midnight',logo:null},slots:structuredClone(DEFAULT_SLOTS),tasks:[],metrics:structuredClone(DEFAULT_METRICS),essentials:structuredClone(DEFAULT_ESSENTIALS),weeks:{}}}
function load(){try{const raw=localStorage.getItem(KEY);if(!raw)return defaultState();const parsed=JSON.parse(raw);if(parsed.version!==1||!Array.isArray(parsed.tasks)||!Array.isArray(parsed.slots)||!Array.isArray(parsed.metrics))throw Error('Unsupported save format');return {...defaultState(),...parsed,profile:{...defaultState().profile,...parsed.profile},weeks:parsed.weeks||{}}}catch(e){console.warn('Could not read BernAPlan save:',e);alert('Your local BernAPlan save could not be loaded. We will not overwrite it; you can export a copy from your browser storage before proceeding.');return defaultState()}}
let preventWrite=false;
function save(){if(preventWrite)return;try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){toast('Device storage is full. Export a backup; changes may not persist.')}}
function weekRecord(){
 const w=state.weeks[selectedWeek]??(state.weeks[selectedWeek]={complete:{},checks:{},notes:{},metrics:{},nonneg:{}});
 w.complete??={};w.checks??={};w.notes??={};w.metrics??={};w.nonneg??={};
 w.proofs??={};w.sessions??={};w.review??={};
 return w;
}
function createTask(day,slot,title,description){return {id:id(),day,slot,title,description,kind:'task',objective:`Make meaningful progress on ${title.toLowerCase()}.`,instructions:['Define the specific result you want by the end of the block.','Work on the most valuable part first.','Capture what you completed and your next action.'],tips:['Keep the task small enough for the available time.','Minimize distractions and record real results.'],checklist:[`Decide what success looks like`,`Complete the main action`,`Record your progress`],metricId:''}}
function applyTemplate(template,overwrite=true,preferences={}){
 const source=CATALOG[template]||CATALOG.everyday;
 if(overwrite)state.tasks=[];
 const pace=preferences.pace||'full';
 const priorityRows=pace==='light'?[0,2]:pace==='balanced'?[0,2,4]:[0,1,2,3,4];
 // Goal-specific adjustments make the weekly plan itself respond to the user's answers.
 const goalAdjustments={
 business:{
  'Find new clients':{'0:2':'Research clients','1:1':'Write proposals','2:1':'Portfolio building'},
  'Finish client work':{'0:1':'Deep project work','0:2':'Project milestone','0:4':'Send deliverables','1:1':'Client communication','1:4':'Deliver client work'},
  'Grow my visibility':{'0:1':'Plan content','0:2':'Brand content','0:4':'Review performance','1:1':'Network & connect','2:3':'Portfolio building'},
  'Get organized':{'0:1':'Pipeline planning','0:2':'Business admin','1:1':'Track progress','2:1':'Plan priorities'}
 },
 student:{
  'Finish assignments':{'0:1':'Assignment work','0:3':'Plan school week','2:2':'Assignment work'},
  'Prepare for exams':{'0:1':'Study session','0:3':'Prepare for exams','2:2':'Study session','4:2':'Prepare for exams'},
  'Improve study habits':{'0:1':'Study session','2:1':'Study session','4:2':'Study review'},
  'Manage my school week':{'0:1':'Plan school week','2:1':'Assignment work','4:2':'Study review'}
 },
 creator:{
  'Publish consistently':{'0:1':'Draft scripts','0:3':'Record / produce','0:4':'Publish / share','2:1':'Edit content'},
  'Finish a creative project':{'0:1':'Deep creative work','0:3':'Edit content','0:4':'Prepare release'},
  'Grow an audience':{'0:1':'Research audience','0:4':'Review performance','1:1':'Community replies'},
  'Organize my ideas':{'0:1':'Explore ideas','0:2':'Refine ideas','4:1':'Collect ideas'}
 },
 everyday:{
  'Feel less overwhelmed':{'0:0':'Choose priorities','0:1':'Plan the day','2:2':'Focus on essentials'},
  'Build healthier routines':{'0:1':'Health & movement','2:2':'Health & movement','3:3':'Health & movement'},
  'Finish personal projects':{'0:1':'Personal project','2:2':'Project progress','3:3':'Personal goals'},
  'Keep up with responsibilities':{'0:1':'Organize tasks','2:2':'Personal admin','3:3':'Weekly reflection'}
 }
 };
 const swaps=goalAdjustments[template]?.[preferences.goal]||{};
 source.rows.forEach((row,slot)=>{row.forEach((original,day)=>{
  const priority=priorityRows.includes(slot);
  const support=priority?null:supportBlock(template,day,slot);
  const name=support?support[0]:(swaps[`${slot}:${day}`]||original);
  const recipe=support?{action:support[1],target:support[2]}:cardRecipe(name);
  const guide=guidanceFor(name,template,preferences);
  const action=recipe?.action||guide.objective;
  const target=recipe?.target||guide.success||'1 completed result';
  const t=createTask(day,slot,name,action);
  Object.assign(t,{description:action,target,objective:support?`${action} Result: ${target}.`:guide.objective,
   instructions:support?[`Start with this activity: ${action}`,`Aim for: ${target}.`,'Record your next action if you did not finish.']:guide.steps,
   tips:guide.tips,checklist:support?[`Begin: ${name}`,`Complete: ${target}`]:guide.checklist,
   example:guide.example||'',success:support?target:(guide.success||''),personalFocus:guide.personalFocus||'',guided:true,support:!!support});
  state.tasks.push(t);
 })});
 state.profile.template=template;
 state.profile.guidance={goal:preferences.goal||'',obstacle:preferences.obstacle||'',pace};
}

function applyTheme(){document.documentElement.style.setProperty('--accent',safeColor(state.profile.accent));document.body.style.backgroundColor=state.profile.background==='paper'?'#171717':'#08090a';let p=$('#brandPicture');if(p){p.innerHTML='';const image=sanitizeImage(state.profile.logo);if(image){const img=document.createElement('img');img.src=image;img.alt='Custom logo';img.style.cssText='max-width:49px;max-height:46px;object-fit:contain';p.appendChild(img)}else{p.textContent='HB'}}}
function toast(message){const el=$('#toast');el.textContent=message;el.style.display='block';clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.style.display='none',3500)}
const dateTitle=()=>{const d=fromKey(selectedWeek),e=addDays(d,6);const a=d.toLocaleDateString(undefined,{month:'short',day:'numeric'});const b=e.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});return `${a} – ${b}`};
function draw(){applyTheme();$('.eyebrow').textContent=state.profile.name.toUpperCase()+' · LIVE WEEKLY CALENDAR';$('#weekLabel').textContent=dateTitle();renderCalendar();renderScoreboard();renderEssentials()}
function renderCalendar(){const week=weekRecord();const calendar=$('#calendar');calendar.style.setProperty('--slot-count',String(state.slots.length));calendar.innerHTML='';let top=document.createElement('div');top.className='col-header';top.style.color='var(--accent)';top.textContent='TIME / FOCUS';calendar.append(top);
for(let day=0;day<7;day++){const d=addDays(fromKey(selectedWeek),day),h=document.createElement('div');h.className='col-header'+(localDateKey(d)===localDateKey(new Date())?' today':'');h.innerHTML=`${DAY_NAMES[day].toUpperCase()}<br><small style="font-weight:400;color:#999;margin-left:4px">${esc(d.toLocaleDateString(undefined,{month:'short',day:'numeric'}))}</small>`;calendar.append(h)}
state.slots.forEach((slot,row)=>{const label=document.createElement('div');label.className='time-label';label.innerHTML=`<strong>${esc(timeLabel(slot.time))}</strong><small>${esc(slot.label)}</small>`;calendar.append(label);for(let day=0;day<7;day++){const cell=document.createElement('div');cell.className='calendar-cell'+(localDateKey(addDays(fromKey(selectedWeek),day))===localDateKey(new Date())?' is-today':'');const tasks=state.tasks.filter(t=>t.day===day&&t.slot===row);if(!tasks.length){const empty=document.createElement('button');empty.className='empty-card';empty.textContent='+ Add block';empty.title='Add a block';empty.onclick=()=>openEditor(null,day,row);cell.append(empty)}else{tasks.forEach(t=>{const b=document.createElement('button');b.className='task-card'+(week.complete[t.id]?' done':'');b.innerHTML=`<span class="card-title">${esc(t.title)}</span><span class="card-desc">${esc(t.description||t.objective)}</span><span class="card-target">${t.target?'TARGET: '+esc(t.target):'ADD A CLEAR TARGET'}</span><span class="card-cardcheck" aria-hidden="true">${week.complete[t.id]?'✓':'○'}</span>`;b.onclick=()=>openTask(t.id);cell.append(b)});if(tasks.length>1)cell.style.overflowY='auto'}calendar.append(cell)}});
const total=state.tasks.length,done=state.tasks.filter(t=>week.complete[t.id]).length;$('#doneBlocks').textContent=done;$('#totalBlocks').textContent=total;$('#openBlocks').textContent=total-done;const p=total?Math.round(done/total*100):0;$('#progressLabel').textContent=p+'%';$('#progressBar').style.width=p+'%';$('#actionProofStats').textContent=state.tasks.filter(t=>week.complete[t.id]&&week.proofs?.[t.id]?.level==='documented').length+' documented outcomes · '+state.tasks.filter(t=>week.complete[t.id]).length+' completed';}
function renderScoreboard(){const week=weekRecord();$('#metricCount').textContent=state.metrics.length+' TRACKED';$('#scoreboard').innerHTML=state.metrics.map(m=>{const value=m.id==='tasks'?state.tasks.filter(t=>week.complete[t.id]).length:(Number(week.metrics[m.id])||0),target=Number(m.target)||0,percent=target?Math.min(100,Math.max(0,value/target*100)):0;return `<div class="score-line"><span class="score-label" title="${esc(m.name)}">${esc(m.name)}</span><div class="score-track"><div class="score-fill" style="width:${percent}%"></div></div><span class="score-value">${esc(String(value))}/${esc(String(target))}</span></div>`}).join('')||'<p class="small-hint">Add a metric to begin tracking your wins.</p>'}
function renderEssentials(){const week=weekRecord();const count=state.essentials.filter(e=>week.nonneg[e.id]).length;$('#nonnegCount').textContent=`${count}/${state.essentials.length}`;$('#nonnegPanel').innerHTML=state.essentials.map(e=>`<label><input type="checkbox" data-nonneg="${esc(e.id)}" ${week.nonneg[e.id]?'checked':''}/><span>${esc(e.name)}</span></label>`).join('')||'<p class="small-hint">Add essentials in Setup.</p>';$('#nonnegStrip').innerHTML=state.essentials.map(e=>`<button class="nonneg-chip ${week.nonneg[e.id]?'hit':''}" data-nonneg-btn="${esc(e.id)}">${week.nonneg[e.id]?'✓':'○'} ${esc(e.name)}</button>`).join('')}
function setNonneg(item,value){weekRecord().nonneg[item]=value;save();draw()}
const openModal=(html,wide=false)=>{const ov=$('#overlay');ov.classList.remove('hidden');ov.setAttribute('aria-hidden','false');ov.innerHTML=`<div class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="BernAPlan dialog">${html}</div>`;ov.querySelector('.close-btn')?.addEventListener('click',closeModal);ov.querySelector('input,button,textarea,select')?.focus()};
function closeModal(){if(focusTick){clearInterval(focusTick);focusTick=null;}const ov=$('#overlay');ov.classList.add('hidden');ov.setAttribute('aria-hidden','true');ov.innerHTML='';activeTask=null;editingTask=false}
function head(title,subtitle=''){return `<div class="modal-header"><div><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div><button type="button" class="close-btn" aria-label="Close">×</button></div>`}
function bullets(lines,ordered=false){const tag=ordered?'ol':'ul';return `<${tag}>${(lines||[]).map(t=>`<li>${esc(t)}</li>`).join('')}</${tag}>`}
const lines=text=>String(text||'').split(/\r?\n/).map(t=>t.trim()).filter(Boolean);
/* ACTION execution system: local-only focus sessions, adaptive micro-steps, honest evidence. */
let focusTick=null;
function taskProofQuestion(t){
 const title=t.title.toLowerCase();
 if(/priorit|plan the day|plan school|plan content|plan next week|pipeline planning|organize task/.test(title))return 'What are your top priorities or planned outcomes, and which first action have you scheduled?';
 if(/proposal|outreach|follow.up|client communication|network|community repl|respond/.test(title))return 'How many messages did you send or follow up on? Record an actual next step or a link to your tracker.';
 if(/study|read|learn|practice|quiz|flashcard|exam|lesson/.test(title))return 'Which topic did you cover? Write one thing you learned or demonstrate it with a short answer.';
 if(/design|create|record|edit|project|portfolio|deliver|draft|publish|release|creative|video|script/.test(title))return 'What did you produce or finish? Describe the deliverable and include a file link if you have one.';
 if(/meeting|appointment|interview|class/.test(title))return 'Did the commitment happen? Write one takeaway or a follow-up action.';
 if(/exercise|health|movement|workout/.test(title))return 'What activity did you do, and for how long? Self-report is fine if there is no external record.';
 if(/review|reflect|weekly reset|check|track progress/.test(title))return 'What changed, what did you learn, and what will you do differently next?';
 return 'What specific result happened? Add a short description or supporting link if one exists.';
}
function nextAction(t,week){const c=week.checks[t.id]||[];return (t.checklist||[]).find((_,i)=>!c[i])||(t.steps||t.instructions||[])[0]||'Choose one clear, manageable first action.'}
function sessionFor(t){return weekRecord().sessions[t.id]||null}
function sessionSeconds(session){if(!session)return 0;return Math.max(0,Number(session.elapsed)||0)+(session.running?Math.max(0,Math.floor((Date.now()-session.startedAt)/1000)):0)}
function formatFocus(seconds){const m=Math.floor(seconds/60),sec=seconds%60;return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`}
function openTask(taskId){
 const t=state.tasks.find(t=>t.id===taskId);if(!t)return;
 activeTask=taskId;const week=weekRecord(),checks=week.checks[t.id]||[],proof=week.proofs[t.id];
 const duration=slotEnd(t.slot),subtitle=`${DAY_NAMES[t.day]} • ${timeLabel(state.slots[t.slot].time)} – ${timeLabel(duration)} • ${t.kind}`;
 const proofMessage=week.complete[t.id]?(proof?.level==='documented'?'Documented result saved — user-provided, not independently verified.':'Completed by self-report; no evidence recorded.'):'Completion is not recorded yet.';
 openModal(head(t.title,subtitle)+`
 <div class="action-heading"><div><strong>YOUR ACTION COACH</strong><p>Start small. Work one step at a time. Show what you finished.</p></div><button type="button" id="startBlock" class="primary-btn">▶ Start Block</button></div>
 <div class="modal-columns"><div>
  <div class="section-box"><h3>◎ Why you're doing this</h3><p>${esc(t.objective||t.description||'Choose a clear result for this block.')}</p>${t.personalFocus?`<p class="personal-goal">✦ ${esc(t.personalFocus)}</p>`:''}</div>
  <div class="section-box"><h3>☷ Follow these steps</h3><p class="small-hint">Follow these in order. One useful step is enough to get moving.</p>${bullets(t.instructions,true)}</div>
  ${t.example?`<div class="section-box guide-example"><h3>◈ Here's what that looks like</h3><p>${esc(t.example)}</p></div>`:''}
  <div class="section-box"><h3>✦ How experienced people approach this</h3>${bullets(t.tips)}</div>
  ${t.success?`<div class="section-box guide-success"><h3>✓ What a finished result looks like</h3><p>${esc(t.success)}</p></div>`:''}
 </div><div>
  <div class="section-box guided-next"><h3>→ Your next small action</h3><p id="nextHint"></p><button type="button" id="doNextStep" class="primary-btn mini-primary">✓ I did this step</button></div>
  <div class="section-box"><h3>☑ Follow-along checklist <span id="checkCount"></span></h3>${(t.checklist||[]).map((item,index)=>`<label class="todo"><input type="checkbox" data-check="${index}" ${checks[index]?'checked':''}/><span>${esc(item)}</span></label>`).join('')||'<p class="small-hint">Add steps through Edit Block.</p>'}</div>
  <div class="section-box"><h3>◇ Need a hand getting started?</h3><p>You don't have to feel motivated first. Tell us what's getting in the way.</p><button type="button" class="secondary-btn help-btn" id="getUnstuck">I don't feel like doing this</button></div>
  <div class="section-box"><h3>▤ Your Notes</h3><div class="field"><textarea id="taskNotes" placeholder="Results, ideas, links or next steps…">${esc(week.notes[t.id]||'')}</textarea></div><button type="button" id="saveNotes" class="secondary-btn">Save notes</button></div>
  <div class="section-box proof-summary"><h3>◉ Completion & accountability</h3><p>${esc(proofMessage)}</p>${proof?.result?`<p><strong>Recorded:</strong> ${esc(proof.result)}</p>`:''}<p class="small-hint">${esc(taskProofQuestion(t))}</p></div>
 </div></div>
 <div class="modal-actions"><button id="markDone" type="button" class="primary-btn">${week.complete[t.id]?'↩ Undo completion':'✓ Show my results & finish'}</button><button id="editThisTask" type="button" class="secondary-btn">✎ Edit block</button><button id="logProgress" type="button" class="secondary-btn">＋ Log a number</button>${t.kind!=='task'?'<button id="exportIcs" class="secondary-btn">↓ Export calendar event</button>':''}</div>`,true);
 const updateCoach=()=>{
  const c=week.checks[t.id]||(week.checks[t.id]=[]), remaining=(t.checklist||[]).findIndex((_,i)=>!c[i]);
  $('#checkCount').textContent=`(${(t.checklist||[]).filter((_,i)=>!!c[i]).length}/${(t.checklist||[]).length})`;
  $('#nextHint').textContent=remaining===-1?'All steps checked! Now record your actual result.':t.checklist[remaining];
  $('#doNextStep').disabled=remaining===-1;
  $('#doNextStep').textContent=remaining===-1?'All steps finished':'✓ I did this step';
 };
 updateCoach();
 document.querySelectorAll('[data-check]').forEach(input=>input.onchange=e=>{const c=week.checks[t.id]||(week.checks[t.id]=[]);c[Number(input.dataset.check)]=e.target.checked;save();updateCoach();});
 $('#doNextStep').onclick=()=>{const c=week.checks[t.id]||(week.checks[t.id]=[]),i=(t.checklist||[]).findIndex((_,ix)=>!c[ix]);if(i<0)return;c[i]=true;const input=document.querySelector(`[data-check="${i}"]`);if(input)input.checked=true;save();updateCoach();};
 $('#saveNotes').onclick=()=>{week.notes[t.id]=$('#taskNotes').value;save();toast('Notes saved')};
 $('#startBlock').onclick=()=>{week.notes[t.id]=$('#taskNotes').value;save();openFocusTask(t.id)};
 $('#getUnstuck').onclick=()=>{week.notes[t.id]=$('#taskNotes').value;save();openMotivation(t.id)};
 $('#markDone').onclick=()=>{week.notes[t.id]=$('#taskNotes').value;if(week.complete[t.id]){week.complete[t.id]=false;save();draw();openTask(t.id);toast('Completion undone. Your evidence is kept for your records.')}else{save();openCompleteTask(t.id)}};
 $('#editThisTask').onclick=()=>openEditor(t);$('#logProgress').onclick=()=>openLog(t.id);
 if(t.kind!=='task')$('#exportIcs').onclick=()=>exportCalendarEvent(t);
}
function openFocusTask(taskId){
 const t=state.tasks.find(x=>x.id===taskId);if(!t)return;
 const week=weekRecord();let session=week.sessions[t.id]||(week.sessions[t.id]={elapsed:0,running:false,minutes:5,startedAt:null});
 const html=head('Focus on: '+t.title,'One step, one timer, no pressure. The timer is optional.')+`
 <div class="focus-hero"><span class="focus-label">START HERE</span><h3>${esc(nextAction(t,week))}</h3><p>${esc(t.objective)}</p></div>
 <div class="section-box focus-tools"><h3>Focus timer</h3><div class="focus-clock" id="focusClock">05:00</div><p class="small-hint">The timer helps you focus; it does not prove the task was done.</p>
 <div class="minute-buttons"><button class="secondary-btn" data-minutes="5">5 minutes</button><button class="secondary-btn" data-minutes="15">15 minutes</button><button class="secondary-btn" data-minutes="25">25 minutes</button></div>
 <div class="modal-actions"><button id="toggleFocus" class="primary-btn">▶ Start focus</button><button id="finishFocus" class="secondary-btn">✓ I finished this step</button><button id="focusHelp" class="secondary-btn">I'm stuck</button><button id="focusBack" class="secondary-btn">← Back to instructions</button></div></div>`;
 openModal(html);
 const clock=$('#focusClock'),start=$('#toggleFocus');
 function update(){const sec=sessionSeconds(session),remaining=Math.max(0,session.minutes*60-sec);clock.textContent=formatFocus(remaining);start.textContent=session.running?'Ⅱ Pause focus':sec>0?'▶ Resume focus':'▶ Start focus';if(remaining===0&&session.running){session.elapsed=session.minutes*60;session.running=false;session.startedAt=null;save();clock.textContent='00:00';toast('Focus interval finished. Record what you actually completed.')}}
 function pause(){if(session.running){session.elapsed=sessionSeconds(session);session.startedAt=null;session.running=false;save()}}
 document.querySelectorAll('[data-minutes]').forEach(btn=>btn.onclick=()=>{pause();session.minutes=Number(btn.dataset.minutes);session.elapsed=0;save();update();});
 start.onclick=()=>{if(session.running)pause();else{if(sessionSeconds(session)>=session.minutes*60)session.elapsed=0;session.running=true;session.startedAt=Date.now();save()}update()};
 $('#finishFocus').onclick=()=>{pause();const c=week.checks[t.id]||(week.checks[t.id]=[]),i=(t.checklist||[]).findIndex((_,n)=>!c[n]);if(i>=0){c[i]=true;save();toast('One step completed. Keep going!')}openTask(t.id)};
 $('#focusHelp').onclick=()=>{pause();openMotivation(t.id)};
 $('#focusBack').onclick=()=>{pause();openTask(t.id)};
 update();focusTick=setInterval(update,1000);
}
function openMotivation(taskId){
 const t=state.tasks.find(x=>x.id===taskId);if(!t)return;
 const options=[['overwhelm','It feels like too much'],['starting','I don’t know where to start'],['focus','I keep getting distracted'],['energy','I’m exhausted'],['fear','I’m afraid I’ll do it wrong']];
 const first=nextAction(t,weekRecord());
 const actions={
  overwhelm:['Shrink the task','Ignore the whole project for now. Your only job is the first small step. If that is still too big, work on it for two minutes.'],
  starting:['Make the first move obvious','Open the document, gather your supplies, or write the first sentence. Do not worry about finishing yet.'],
  focus:['Clear one distraction','Close one unrelated tab, silence notifications briefly, and give just five minutes to this task.'],
  energy:['Make room for recovery','Rest or do a two-minute version. If you genuinely need a break, choose a new time without treating that as failure.'],
  fear:['Try a rough first draft','A first attempt is allowed to be imperfect. Make a draft you can improve later; you are not being graded here.']
 };
 const show=(kind)=>{
  const a=actions[kind],next=esc(first);
  openModal(head('Let’s make '+t.title+' easier','You are allowed to start small, rest, or ask for help.')+`<p class="small-hint">What is making this difficult right now?</p><div class="rescue-choices">${options.map(([key,label])=>`<button type="button" class="wizard-tile ${kind===key?'active':''}" data-rescue="${key}">${esc(label)}</button>`).join('')}</div>
  <div class="section-box rescue-answer"><h3>✦ ${esc(a[0])}</h3><p>${esc(a[1])}</p><p class="rescue-next"><strong>Your actual next action:</strong> ${next}</p></div>
  <div class="modal-actions"><button class="primary-btn" id="rescueStart">▶ Try five minutes</button><button class="secondary-btn" id="rescueBack">← Back to task</button></div>`,true);
  document.querySelectorAll('[data-rescue]').forEach(el=>el.onclick=()=>show(el.dataset.rescue));
  $('#rescueStart').onclick=()=>openFocusTask(t.id);
  $('#rescueBack').onclick=()=>openTask(t.id);
 };
 const obstacle=state.profile.guidance?.obstacle;show(obstacle==='overwhelm'?'overwhelm':obstacle==='focus'?'focus':obstacle==='starting'?'starting':'starting');
}
function openCompleteTask(taskId){
 const t=state.tasks.find(x=>x.id===taskId);if(!t)return;
 const week=weekRecord(),old=week.proofs[t.id]||{},question=taskProofQuestion(t),checks=week.checks[t.id]||[];
 const count=(t.checklist||[]).filter((_,i)=>checks[i]).length,total=(t.checklist||[]).length;
 openModal(head('Show your results: '+t.title,'This is for your own accountability, not an outside audit.')+`
 <div class="proof-context"><h3>What were you trying to accomplish?</h3><p>${esc(t.success||t.objective||t.description)}</p></div>
 <div class="section-box"><h3>◉ What actually happened?</h3><p>${esc(question)}</p>
 <div class="field"><label for="proofResult">Describe the result in your own words</label><textarea id="proofResult" placeholder="Example: Finished the draft and shared the link; here’s the next step...">${esc(old.result||'')}</textarea></div>
 <div class="field"><label for="proofLink">Supporting link (optional)</label><input id="proofLink" type="url" placeholder="https://..." value="${esc(old.link||'')}"></div>
 <p class="small-hint">${count} of ${total} checklist steps marked. A note or link documents your result but is not independently verified. Keep private details out of links you share.</p></div>
 <div class="section-box"><h3>Choose how to record completion</h3>
 <div class="modal-actions"><button type="button" id="saveEvidence" class="primary-btn">✓ Save documented result</button><button type="button" id="selfReport" class="secondary-btn">✓ Mark complete (self-reported)</button><button type="button" id="proofBack" class="secondary-btn">← Back</button></div>
 <p class="small-hint" style="margin-top:9px">Documented = you wrote down an outcome or attached a link. Self-reported = you confirm completion without proof. Neither is externally authenticated.</p></div>`,true);
 function finish(level){
  const result=$('#proofResult').value.trim(),link=$('#proofLink').value.trim();
  if(link&&!/^https?:\/\//i.test(link)){toast('Use a full http:// or https:// URL, or leave the link blank.');$('#proofLink').focus();return;}
  if(level==='documented'&&!result&&!link){toast('Write down what you finished or add a supporting link.');$('#proofResult').focus();return;}
  week.complete[t.id]=true;week.proofs[t.id]={level,result:level==='documented'?result:'',link:level==='documented'?link:'',recordedAt:new Date().toISOString(),prompt:question};
  if(level==='documented'&&result)week.notes[t.id]=[week.notes[t.id]||'',result].filter(Boolean).join('\n') .slice(0,12000);
  save();draw();closeModal();toast(level==='documented'?'Outcome documented. Nice work following through!':'Task recorded as self-reported completion.');
 }
 $('#saveEvidence').onclick=()=>finish('documented');$('#selfReport').onclick=()=>finish('self');$('#proofBack').onclick=()=>openTask(t.id);
}
function openWeeklyReview(){
 const week=weekRecord(),existing=week.review||{},all=state.tasks.length,finished=state.tasks.filter(t=>week.complete[t.id]).length,documented=state.tasks.filter(t=>week.complete[t.id]&&week.proofs[t.id]?.level==='documented').length;
 const rate=all?finished/all:0;
 const suggestion=rate<.35?'Consider reducing next week to two or three essential blocks per day. Consistency starts with a realistic plan.':rate<.75?'You made progress. Choose one frequent obstacle to address and leave buffer time between tasks.':'Your follow-through was strong. Keep a realistic pace and review the quality of outcomes, not just checkmarks.';
 openModal(head('Weekly Reality Check','An honest review helps you make next week easier.')+`
 <div class="review-summary"><div><strong>${finished}/${all}</strong><small>blocks completed</small></div><div><strong>${documented}</strong><small>documented outcomes</small></div><div><strong>${all?Math.round(rate*100):0}%</strong><small>completion rate</small></div></div>
 <div class="field"><label for="reviewWins">What actually went well this week?</label><textarea id="reviewWins" placeholder="A win, finished project, or step forward...">${esc(existing.wins||'')}</textarea></div>
 <div class="field"><label for="reviewBarrier">What got in the way?</label><select id="reviewBarrier"><option value="none">Nothing major</option><option value="overwhelm">Too much on my calendar</option><option value="focus">Distractions</option><option value="energy">Low energy</option><option value="starting">I struggled to begin</option><option value="other">Something else</option></select></div>
 <div class="field"><label for="reviewChange">What's one thing you'll change next week?</label><textarea id="reviewChange" placeholder="Example: Shorter morning focus blocks...">${esc(existing.change||'')}</textarea></div>
 <div class="section-box"><h3>✦ Your suggested adjustment</h3><p>${esc(suggestion)}</p><p class="small-hint">A rule-based suggestion, not an AI assessment. It does not change your calendar without permission.</p></div>
 <div class="modal-actions"><button id="saveReview" class="primary-btn">Save my review</button><button id="cancelReview" class="secondary-btn">Close</button></div>`,true);
 $('#reviewBarrier').value=existing.barrier||'none';
 $('#saveReview').onclick=()=>{week.review={wins:$('#reviewWins').value.trim(),barrier:$('#reviewBarrier').value,change:$('#reviewChange').value.trim(),savedAt:new Date().toISOString()};save();closeModal();toast('Weekly review saved. Your plan remains unchanged.')};
 $('#cancelReview').onclick=closeModal;
}
function slotEnd(index){return state.slots[index+1]?.time||((Number(state.slots[index].time.slice(0,2))+1)%24).toString().padStart(2,'0')+state.slots[index].time.slice(2)}
function openLog(taskId){const t=state.tasks.find(x=>x.id===taskId);const opts=state.metrics.filter(m=>m.id!=='tasks').map(m=>`<option value="${esc(m.id)}" ${t?.metricId===m.id?'selected':''}>${esc(m.name)}</option>`).join('');if(!opts){closeModal();toast('Add a scoreboard metric in Setup first');return}openModal(head('Log actual progress','Only recorded results count toward your scoreboard.')+`<div class="field"><label for="metricToLog">What did you accomplish?</label><select id="metricToLog">${opts}</select></div><div class="field"><label for="resultNumber">How much?</label><input id="resultNumber" type="number" min="0" max="1000000" step="0.25" value="1" /></div><div class="modal-actions"><button id="addResult" class="primary-btn">Add to scoreboard</button><button id="skipResult" class="secondary-btn">Not now</button></div>`);$('#skipResult').onclick=closeModal;$('#addResult').onclick=()=>{let key=$('#metricToLog').value,v=Number($('#resultNumber').value);if(!Number.isFinite(v)||v<0||v>1e6){toast('Enter a valid positive number');return}const week=weekRecord();week.metrics[key]=(Number(week.metrics[key])||0)+v;save();closeModal();draw();toast('Scoreboard updated')}}
function field(name,id,value='',opts={}){const type=opts.type||'text';if(type==='textarea')return `<div class="field"><label for="${id}">${esc(name)}</label><textarea id="${id}" placeholder="${esc(opts.placeholder||'')}">${esc(value)}</textarea></div>`;return `<div class="field"><label for="${id}">${esc(name)}</label><input id="${id}" type="${type}" value="${esc(value)}" ${opts.min!==undefined?'min="'+opts.min+'"':''}/></div>`}
function openEditor(task=null,day=null,slot=null){editingTask=true;const isEdit=!!task;const t=task||createTask(day??0,slot??0,'','');const dayOptions=DAY_NAMES.map((name,i)=>`<option value="${i}" ${t.day===i?'selected':''}>${esc(name)}</option>`).join('');const slotOptions=state.slots.map((s,i)=>`<option value="${i}" ${t.slot===i?'selected':''}>${esc(timeLabel(s.time)+' · '+s.label)}</option>`).join('');const typeOpts=[['task','Regular task'],['meeting','Meeting / appointment'],['deadline','Deadline'],['reminder','Important reminder']].map(([val,txt])=>`<option value="${val}" ${t.kind===val?'selected':''}>${txt}</option>`).join('');
openModal(head(isEdit?'Edit this block':'Add a calendar block','Make your action plan personal. Every field can be changed.')+`<div class="form-grid">${field('Task title','editTitle',t.title)}${field('Action: What should I do?','editDesc',t.description)}${field('Target: What will I finish?','editTarget',t.target||'')}<div class="field"><label for="editDay">Day of week</label><select id="editDay">${dayOptions}</select></div><div class="field"><label for="editSlot">Time row</label><select id="editSlot">${slotOptions}</select></div><div class="field"><label for="editKind">Type</label><select id="editKind">${typeOpts}</select></div><div class="field"><label for="editMetric">Suggested metric when logging results</label><select id="editMetric"><option value="">None / choose later</option>${state.metrics.map(m=>`<option value="${esc(m.id)}" ${t.metricId===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select></div></div><div class="section-box"><h3>Need help writing the instructions?</h3><p>Give the block a clear title, then use our free guide library to suggest beginner-friendly steps. You can still edit anything afterward.</p><button id="suggestGuide" type="button" class="secondary-btn">✦ Suggest steps for this task</button></div>${field('Objective','editObjective',t.objective,{type:'textarea'})}${field('Instructions — one step per line','editSteps',(t.instructions||[]).join('\n'),{type:'textarea'})}${field('Best practices — one tip per line','editTips',(t.tips||[]).join('\n'),{type:'textarea'})}${field('Checklist — one item per line','editChecks',(t.checklist||[]).join('\n'),{type:'textarea'})}<p class="small-hint">For meetings, deadlines and reminders, you can export an .ics event. Direct Google/Outlook sync is not connected in this prototype.</p><div class="modal-actions"><button id="saveTask" class="primary-btn">${isEdit?'Save changes':'Create block'}</button>${isEdit?'<button id="deleteTask" class="secondary-btn danger">Delete block</button>':''}<button id="cancelEditor" class="secondary-btn">Cancel</button></div>`,true);
let pendingGuide=null;
$('#suggestGuide').onclick=()=>{
 const title=$('#editTitle').value.trim();if(!title){toast('Name the task first so we can suggest useful steps');return}
 if(!confirm('Replace the objective, instructions, tips and checklist in this editor with suggestions? Your other task details will stay.'))return;
 const g=guidanceFor(title,state.profile.template,state.profile.guidance||{});
 pendingGuide={...g,title};
 $('#editObjective').value=g.objective;$('#editSteps').value=g.steps.join('\n');$('#editTips').value=g.tips.join('\n');$('#editChecks').value=g.checklist.join('\n');const r=cardRecipe(title);if(r){$('#editDesc').value=r.action;$('#editTarget').value=r.target;}
 toast('Suggested guide added. Review and save when ready.');
};
$('#cancelEditor').onclick=()=>isEdit?openTask(t.id):closeModal();$('#saveTask').onclick=()=>{const title=$('#editTitle').value.trim();if(!title){toast('Give this block a title');$('#editTitle').focus();return}if(!$('#editDesc').value.trim()){toast('Add a short action so the calendar tells you what to do.');$('#editDesc').focus();return}const next={...t,title,description:$('#editDesc').value.trim(),target:$('#editTarget').value.trim(),day:Number($('#editDay').value),slot:Number($('#editSlot').value),kind:$('#editKind').value,metricId:$('#editMetric').value,objective:$('#editObjective').value.trim(),instructions:lines($('#editSteps').value),tips:lines($('#editTips').value),checklist:lines($('#editChecks').value)};
if(title!==t.title){next.example='';next.success='';next.personalFocus='';}
if(pendingGuide&&pendingGuide.title===title){next.example=pendingGuide.example||'';next.success=pendingGuide.success||'';next.personalFocus=pendingGuide.personalFocus||'';next.guided=true;}if(isEdit){state.tasks=state.tasks.map(x=>x.id===t.id?next:x)}else{state.tasks.push(next)}save();closeModal();draw();toast(isEdit?'Block updated':'New block added')};if(isEdit)$('#deleteTask').onclick=()=>{if(!confirm(`Delete "${t.title}" from the weekly template?`))return;state.tasks=state.tasks.filter(x=>x.id!==t.id);save();closeModal();draw();toast('Block deleted')}}
function openSettings(tab='schedule'){settingsTab=tab;const tabs=[['schedule','My schedule'],['appearance','Appearance'],['goals','Goals & scoreboard'],['essentials','Essentials'],['data','Backups']];const b=head('Build Your Command Center','Set it up your way. All personalization is free.')+`<div class="settings-tab-row">${tabs.map(([key,label])=>`<button data-tab="${key}" class="tab-btn ${settingsTab===key?'active':''}">${label}</button>`).join('')}</div><div id="settingsBody"></div>`;openModal(b,true);document.querySelectorAll('[data-tab]').forEach(el=>el.onclick=()=>openSettings(el.dataset.tab));renderSettingsBody()}
function renderSettingsBody(){const container=$('#settingsBody');if(!container)return;
if(settingsTab==='schedule'){container.innerHTML=`<div class="section-box"><h3>Not sure what to put in your calendar?</h3><p>Answer four quick multiple-choice questions. We’ll build a weekly playbook with guided instructions based on your goals—no long forms or paid AI.</p><button class="primary-btn" type="button" id="restartWizard">✦ Build a guided weekly plan →</button><p class="small-hint">Rebuilding will replace the current task layout after confirmation. Export a backup first if you need to preserve it.</p></div><p class="small-hint">Your calendar always shows Monday–Sunday. Edit the time rows without changing the seven-day layout.</p><div id="slotFields">${state.slots.map((s,i)=>`<div class="form-grid"><div class="field"><label>Row ${i+1} time</label><input type="time" data-time="${i}" value="${esc(s.time)}" /></div><div class="field"><label>Focus label</label><input data-slot-label="${i}" value="${esc(s.label)}" /></div></div>`).join('')}</div><div class="modal-actions"><button class="primary-btn" id="saveSlots">Save times</button><button class="secondary-btn" id="addSlot">+ Add row</button>${state.slots.length>1?'<button class="secondary-btn" id="removeSlot">Remove last row</button>':''}</div><div class="section-box"><h3>Starting templates</h3><p>Choose a user-focused example, or start blank. Changing templates replaces the current weekly block definitions, so export a backup first if needed.</p><div class="template-options">${Object.entries(CATALOG).map(([key,val])=>`<button class="template-btn" data-template="${key}"><b>${esc(val.label)}</b><small>${esc(val.description)}</small></button>`).join('')}</div></div>`;
$('#restartWizard').onclick=()=>openWelcome(true);
$('#saveSlots').onclick=()=>{const inputs=[...container.querySelectorAll('[data-time]')];const slots=inputs.map((el,i)=>({id:state.slots[i].id,time:el.value,label:container.querySelector(`[data-slot-label="${i}"]`).value.trim()||'FOCUS'}));if(slots.some(x=>!/^\d\d:\d\d$/.test(x.time))){toast('Every time row needs a valid time');return}if(new Set(slots.map(x=>x.time)).size!==slots.length){toast('Each row needs a different time');return}state.slots=slots;save();draw();toast('Time rows updated')};$('#addSlot').onclick=()=>{if(state.slots.length>=9){toast('Maximum 9 rows to keep the calendar readable');return}state.slots.push({id:id(),time:'12:00',label:'NEW ROW'});save();draw();openSettings('schedule')};const rm=$('#removeSlot');if(rm)rm.onclick=()=>{const i=state.slots.length-1;if(state.tasks.some(t=>t.slot===i)&&!confirm('Remove the last row and all blocks in it?'))return;state.tasks=state.tasks.filter(t=>t.slot!==i);state.slots.pop();save();draw();openSettings('schedule')};container.querySelectorAll('[data-template]').forEach(btn=>btn.onclick=()=>{if(state.tasks.length&&!confirm('Replace your current calendar blocks with this template? Export a backup first if needed.'))return;applyTemplate(btn.dataset.template);save();draw();openSettings('schedule');toast('Calendar template loaded')});}
if(settingsTab==='appearance'){container.innerHTML=`<div class="form-grid">${field('Name your command center','customName',state.profile.name)}${field('Accent color','customAccent',safeColor(state.profile.accent),{type:'color'})}</div><div class="field"><label>Header logo (PNG, JPEG, WebP under 200 KB)</label><input type="file" id="customLogo" accept="image/png,image/jpeg,image/webp"/></div><p class="small-hint">Leave the logo picker untouched to keep the current mark. Uploading your own logo is free. HireBerna product attribution remains in the header/footer.</p><div class="modal-actions"><button class="primary-btn" id="saveAppearance">Apply appearance</button><button class="secondary-btn" id="resetLogo">Remove custom logo</button></div>`;let newLogo=state.profile.logo;$('#customLogo').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>200000||!['image/png','image/jpeg','image/webp'].includes(f.type)){toast('Choose a PNG, JPEG, or WebP smaller than 200 KB');e.target.value='';return}newLogo=await new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(f)});toast('Logo ready — click Apply appearance')};$('#saveAppearance').onclick=()=>{state.profile.name=$('#customName').value.trim()||'My Command Center';state.profile.accent=safeColor($('#customAccent').value);state.profile.logo=sanitizeImage(newLogo);save();draw();closeModal();toast('Appearance updated')};$('#resetLogo').onclick=()=>{state.profile.logo=null;save();draw();openSettings('appearance');toast('Custom logo removed')}}
if(settingsTab==='goals'){const week=weekRecord();container.innerHTML=`<p class="small-hint">Choose the exact numbers that matter to you. Metrics are only increased when you log real results.</p><div id="metricEditors">${state.metrics.map((m,i)=>`<div class="metric-editor"><div class="field"><label>Metric ${i+1}</label><input data-metric-name="${i}" value="${esc(m.name)}"/></div><div class="field"><label>Weekly goal</label><input type="number" min="0" data-metric-target="${i}" value="${esc(m.target)}"/></div><button class="secondary-btn" data-remove-metric="${i}" aria-label="Remove metric">×</button></div>`).join('')}</div><div class="modal-actions"><button id="saveMetrics" class="primary-btn">Save metrics</button><button id="addMetric" class="secondary-btn">+ Add metric</button><button id="adjustMetrics" class="secondary-btn">Log / correct progress</button></div>`;$('#saveMetrics').onclick=()=>{state.metrics=state.metrics.map((m,i)=>({...m,name:container.querySelector(`[data-metric-name="${i}"]`).value.trim()||m.name,target:Math.max(0,Number(container.querySelector(`[data-metric-target="${i}"]`).value)||0)}));save();draw();openSettings('goals');toast('Weekly goals saved')};$('#addMetric').onclick=()=>{if(state.metrics.length>=12){toast('Limit 12 metrics to keep the board readable');return}state.metrics.push({id:id(),name:'New metric',target:5,unit:'count'});save();draw();openSettings('goals')};container.querySelectorAll('[data-remove-metric]').forEach(btn=>btn.onclick=()=>{if(!confirm('Remove this metric from the scoreboard?'))return;state.metrics.splice(Number(btn.dataset.removeMetric),1);save();draw();openSettings('goals')});$('#adjustMetrics').onclick=()=>openAdjustMetrics();}
if(settingsTab==='essentials'){container.innerHTML=`<p class="small-hint">Choose the must-do habits or commitments for this week. Check them off in the board's bottom strip.</p><div id="essentialFields">${state.essentials.map((e,i)=>`<div class="field"><label>Essential ${i+1}</label><input data-essential="${i}" value="${esc(e.name)}"/></div>`).join('')}</div><div class="modal-actions"><button id="saveEssentials" class="primary-btn">Save essentials</button><button id="addEssential" class="secondary-btn">+ Add essential</button><button id="removeEssential" class="secondary-btn">Remove last</button></div>`;$('#saveEssentials').onclick=()=>{state.essentials=state.essentials.map((e,i)=>({...e,name:container.querySelector(`[data-essential="${i}"]`).value.trim()||e.name}));save();draw();openSettings('essentials');toast('Essentials saved')};$('#addEssential').onclick=()=>{if(state.essentials.length>=15){toast('Maximum 15 essentials');return}state.essentials.push({id:id(),name:'New essential'});save();draw();openSettings('essentials')};$('#removeEssential').onclick=()=>{state.essentials.pop();save();draw();openSettings('essentials')};}
if(settingsTab==='data'){container.innerHTML=`<div class="section-box"><h3>Your data stays on this device</h3><p>BernAPlan currently uses browser local storage. It does NOT have cloud backup, direct Google/Outlook calendar synchronization, or automatic device syncing yet. Export your data regularly, especially before clearing browser data or changing computers.</p></div><div class="modal-actions"><button id="exportBackup" class="primary-btn">↓ Export JSON backup</button><button id="importBackup" class="secondary-btn">↑ Import backup</button><input id="backupFile" type="file" accept="application/json,.json" class="hidden"/></div><p class="small-hint">This is an early prototype developed independently of the existing v0.4.2 desktop release. Import only backups exported by this prototype.</p>`;$('#exportBackup').onclick=()=>downloadFile('BernAPlan-backup-'+localDateKey(new Date())+'.json',JSON.stringify(state,null,2),'application/json');$('#importBackup').onclick=()=>$('#backupFile').click();$('#backupFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>1e6){toast('Backup is too large');return}let candidate;try{candidate=JSON.parse(await file.text());if(candidate.version!==1||!Array.isArray(candidate.tasks)||!Array.isArray(candidate.slots)||!Array.isArray(candidate.metrics)||!Array.isArray(candidate.essentials)||typeof candidate.weeks!=='object')throw Error('Invalid format')}catch(err){toast('Invalid BernAPlan prototype backup');return}if(!confirm('Import this backup and replace the current local board?'))return;state=candidate;save();draw();closeModal();toast('Backup imported')};}
}
function openAdjustMetrics(){const week=weekRecord();openModal(head('Correct weekly results','Enter actual totals for the selected week. Completed tasks are counted automatically.')+state.metrics.filter(m=>m.id!=='tasks').map(m=>field(m.name,'adjust_'+m.id,week.metrics[m.id]||0,{type:'number'})).join('')+`<div class="modal-actions"><button class="primary-btn" id="saveAdjust">Save results</button><button class="secondary-btn" id="cancelAdjust">Cancel</button></div>`);$('#cancelAdjust').onclick=closeModal;$('#saveAdjust').onclick=()=>{for(const m of state.metrics.filter(m=>m.id!=='tasks')){const num=Number($('#adjust_'+m.id).value);if(!Number.isFinite(num)||num<0||num>1e6){toast('Enter nonnegative results');return}week.metrics[m.id]=num}save();closeModal();draw();toast('Results saved')}}
function downloadFile(filename,content,type){const link=document.createElement('a');const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportCalendarEvent(task){if(task.kind==='task')return;const day=addDays(fromKey(selectedWeek),task.day),start=state.slots[task.slot].time,end=slotEnd(task.slot);const toICS=(date,time)=>{const [h,m]=time.split(':').map(Number);const d=new Date(date);d.setHours(h,m,0,0);return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}00`};const clean=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//HireBerna//BernAPlan//EN','BEGIN:VEVENT',`UID:${task.id}-${selectedWeek}@bernaplan.local`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART:${toICS(day,start)}`,`DTEND:${toICS(day,end)}`,`SUMMARY:${clean(task.title)}`,`DESCRIPTION:${clean(task.objective||task.description)}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');downloadFile('BernAPlan-'+task.kind+'-'+selectedWeek+'.ics',ics,'text/calendar');toast('Event exported. Import the .ics file into your calendar. No live sync is active.')}
function openWelcome(rebuild=false){
 let step=0;
 const picks={template:state.profile.template||'everyday',goal:state.profile.guidance?.goal||'',obstacle:state.profile.guidance?.obstacle||'starting',pace:state.profile.guidance?.pace||'full'};
 const steps=[['Choose a starting point','What area of life are you planning?'],['Pick a goal','What would make the biggest difference right now?'],['Tell us what gets in the way','Which challenge sounds most familiar?'],['Choose your rhythm','How much structure would help you?'],['Check your playbook','Here’s what we’ll put on your calendar.']];
 function tile(id,value,label,desc='',chosen=false){return `<button type="button" class="wizard-tile ${chosen?'active':''}" data-wizard-pick="${esc(id)}" data-value="${esc(value)}" aria-pressed="${chosen?'true':'false'}"><strong>${esc(label)}</strong>${desc?`<small>${esc(desc)}</small>`:''}<span class="wizard-check">${chosen?'✓':'+'}</span></button>`}
 function drawWizard(){
 const title=steps[step][0],subtitle=steps[step][1];
 let body='';
 if(step===0)body=`<div class="wizard-grid">${Object.entries(CATALOG).map(([k,v])=>tile('template',k,v.label,v.description,picks.template===k)).join('')}</div>`;
 if(step===1){const goals=GOAL_OPTIONS[picks.template]||GOAL_OPTIONS.everyday;if(!goals.includes(picks.goal))picks.goal=goals[0];body=`<div class="wizard-grid">${goals.map(g=>tile('goal',g,g,'',picks.goal===g)).join('')}</div>`}
 if(step===2)body=`<div class="wizard-grid">${OBSTACLE_OPTIONS.map(([k,l])=>tile('obstacle',k,l,'',picks.obstacle===k)).join('')}</div>`;
 if(step===3)body=`<div class="wizard-grid">${PACES.map(([k,l,d])=>tile('pace',k,l,d,picks.pace===k)).join('')}</div>`;
 if(step===4){const examples=CATALOG[picks.template]?.rows?.[0]||[];const guide=guidanceFor(examples[0]||'Plan the day',picks.template,{goal:picks.goal,obstacle:picks.obstacle});const rows=picks.pace==='full'?5:picks.pace==='balanced'?3:2;body=`<div class="wizard-review"><p><strong>Your focus:</strong> ${esc(picks.goal||'My priorities')}</p><p><strong>My challenge:</strong> ${esc(OBSTACLE_OPTIONS.find(v=>v[0]===picks.obstacle)?.[1]||'Getting started')}</p><p><strong>Your calendar:</strong> 7 days × 5 filled rows. ${rows} daily priority blocks; other rows have light support or recovery activities. You can change them anytime.</p><div class="section-box guide-example"><h3>Example: ${esc(examples[0]||'Your first task')}</h3><p>${esc(guide.objective)}</p><p class="small-hint">First step: ${esc(guide.steps[0])}</p></div></div>${field('Optional: Name your command center','setupName',state.profile.name)}`;}
 const percentage=Math.round((step+1)/steps.length*100);
 openModal(head('Build Your Command Center',subtitle)+`<div class="wizard-progress"><span>STEP ${step+1} OF ${steps.length}</span><span>${percentage}%</span></div><div class="wizard-track"><div style="width:${percentage}%"></div></div><p class="small-hint">Just tap your choices. No typing required. You can change anything later.</p>${body}<div class="modal-actions wizard-nav">${step>0?'<button type="button" class="secondary-btn" id="wizardBack">← Back</button>':''}<button type="button" class="primary-btn" id="wizardNext">${step===4?'✓ Create My Playbook':'Continue →'}</button></div>`,true);
 document.querySelectorAll('[data-wizard-pick]').forEach(el=>el.onclick=()=>{const key=el.dataset.wizardPick;picks[key]=el.dataset.value; if(key==='template')picks.goal=(GOAL_OPTIONS[picks.template]||GOAL_OPTIONS.everyday)[0];drawWizard();});
 const back=$('#wizardBack');if(back)back.onclick=()=>{step--;drawWizard()};
 $('#wizardNext').onclick=()=>{
  if(step<4){step++;drawWizard();return}
  if(rebuild&&state.tasks.length&&!confirm('This will replace the task layout on your calendar. Your existing plan has NOT been backed up automatically. Continue?'))return;
  const name=$('#setupName').value.trim();state.profile.name=name||'My Command Center';
  applyTemplate(picks.template,true,{goal:picks.goal||GOAL_OPTIONS[picks.template]?.[0],obstacle:picks.obstacle,pace:picks.pace});
  state.configured=true;save();closeModal();draw();toast('Your guided playbook is ready! Open any block to follow its steps.');
 };
 }
 drawWizard();
}
$('#calendar').addEventListener('click',()=>{});$('#prevWeek').onclick=()=>{selectedWeek=localDateKey(addDays(fromKey(selectedWeek),-7));draw()};$('#nextWeek').onclick=()=>{selectedWeek=localDateKey(addDays(fromKey(selectedWeek),7));draw()};$('#jumpToday').onclick=()=>{selectedWeek=localDateKey(beginningOfWeek());draw()};$('#newTask').onclick=()=>openEditor();$('#settingsButton').onclick=()=>openSettings('appearance');$('#openSetup').onclick=()=>openSettings('schedule');$('#editScoreboard').onclick=()=>openSettings('goals');$('#weeklyReview').onclick=openWeeklyReview;$('#editNonneg').onclick=()=>openSettings('essentials');$('#nonnegPanel').onchange=e=>{if(e.target.matches('[data-nonneg]'))setNonneg(e.target.dataset.nonneg,e.target.checked)};$('#nonnegStrip').onclick=e=>{const btn=e.target.closest('[data-nonneg-btn]');if(btn){const key=btn.dataset.nonnegBtn;setNonneg(key,!weekRecord().nonneg[key])}};$('#overlay').addEventListener('click',e=>{if(e.target===$('#overlay'))closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#overlay').classList.contains('hidden'))closeModal()});
state=load();
const previousGuidesImproved=state.tasks.reduce((n,t)=>n+(improveGuideIfGeneric(t)?1:0),0);
const agendaImproved=upgradeGeneratedCalendar();
if(previousGuidesImproved||agendaImproved||!localStorage.getItem(KEY))save();
draw();if(!state.configured)openWelcome();
})();

