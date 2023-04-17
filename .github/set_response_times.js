function calcResponseTimeForIssueCreatedAt(createdAt) {
    const issueOpenedDate = new Date(createdAt);
    const issueTriagedDate = new Date();
    const businessDaysResponseTime = calcBusinessDaysBetweenDates(issueOpenedDate, issueTriagedDate);
    return businessDaysResponseTime;
}

function calcBusinessDaysBetweenDates(openedDate, triagedDate) {
    let differenceInWeeks, responseTime;
    if (triagedDate < openedDate)
        return -1; // error code if dates transposed
    let openedDay = openedDate.getDay(); // day of week
    let triagedDay = triagedDate.getDay();
    openedDay = (openedDay == 0) ? 7 : openedDay; // change Sunday from 0 to 7
    triagedDay = (triagedDay == 0) ? 7 : triagedDay;
    openedDay = (openedDay > 5) ? 5 : openedDay; // only count weekdays
    triagedDay = (triagedDay > 5) ? 5 : triagedDay;
    // calculate differnece in weeks (1000mS * 60sec * 60min * 24hrs * 7 days = 604800000)
    differenceInWeeks = Math.floor((triagedDate.getTime() - openedDate.getTime()) / 604800000);
    if (openedDay < triagedDay) { //Equal to makes it reduce 5 days
        responseTime = (differenceInWeeks * 5) + (triagedDay - openedDay);
    }
    else if (openedDay == triagedDay) {
        responseTime = differenceInWeeks * 5;
    }
    else {
        responseTime = ((differenceInWeeks + 1) * 5) - (openedDay - triagedDay);
    }
    return (responseTime);
}

module.exports = async(context, osmetadata) => {
    const foundResponseTime = await osmetadata(context).get('response_time_in_business_days');
    if (foundResponseTime) {
      const foundString = "already found response time in business days: " + foundResponseTime
      console.log(foundString);
      return foundString;
    }
    if (context.payload.comment && context.payload.comment.author_association != "MEMBER" &&  context.payload.comment.author_association != "OWNER" && context.payload.comment.author_association != "CONTRIBUTOR") {
      return;
    }
    const businessDaysResponseTime = calcResponseTimeForIssueCreatedAt(context.payload.issue.created_at);
    console.log("response time in business days: " + businessDaysResponseTime);
    const result = osmetadata(context, context.payload.issue).set('response_time_in_business_days', businessDaysResponseTime)
    console.log("osmetadata update result: " + result);
    return "set response time in business days: " + businessDaysResponseTime;
}
