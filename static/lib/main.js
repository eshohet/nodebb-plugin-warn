"use strict";

/*globals $, socket, app*/

$(window).on('action:ajaxify.end', function (ev, data) {
    if (data.url && data.url.match('^topic/')) {
        $('[component="topic"]').on('click', '[component="post/warn-user"]', function (e) {
            const pid = $(this).attr("data-pid");
            const uid = $(this).attr("data-uid");
            const event = `plugins.warn.addWarn`;
            socket.emit(event, { pid: pid, uid: uid }, (error) => {
                app.alertError(error.message);
            });
        });
    }
});
