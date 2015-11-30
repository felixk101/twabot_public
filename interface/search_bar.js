"use strict";

function search(formID, channelNameID){
    let inputField = document.getElementById(channelNameID)
    let channelName = inputField.value;
    inputField='';
    let form = document.getElementById(formID);
    form.action = '/user/'+channelName;
    form.submit();
}
