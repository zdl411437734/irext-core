/*
 * Created by Strawmanbobi
 * 2014-08-30
 */

function objectMemberCount(conditions) {
    var memberCount = 0;
    for(var f in conditions) {
        memberCount++;
    }
    var whereClause = "";
           var index = 0;
           for(var field in conditions) {
               whereClause += field + " = '" + conditions[field] + "'";
               if(index < memberCount - 1) {
                   whereClause += " AND ";
               }
           }
           return  whereClause;
}

module.exports = objectMemberCount;