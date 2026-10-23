/* Internal-student enrollment configuration. Configure only confirmed school offerings.
   applicationUrl must point to the INTERNAL winter application form, not a trial form.
   No answer or personal data is sent automatically.
   approvedPlans: { planId: { title, composition, materials, description, goal } }
   Use approvedPlans only for courses whose otherwise undefined content has been fixed.
*/
window.WINTER_ENROLLMENT = { applicationUrl:'', offeredIds:null, approvedPlans:{} };
window.WINTER_BOOKING_URL = '';
