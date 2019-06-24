/* eslint-env browser */
/* global io */
(function connect() {
  function connectToSocket(store) {
    const socket = io();

    function init() {
      socket.emit("get_dashboards_config");

      socket.emit("catchup");
    }

    socket.on("get_dashboards_config", function(dashboards) {
      try {
        store.clearErrorMessages();
        store.updateDashboards(dashboards);
        store.updateCurrentDashboardTitle(null);
      } catch (err) {
        store.addErrorMessage(err.message);
      }
    });

    socket.on("catchup_batch", function(messages) {
      store.appendEvents(messages);
    });

    socket.on("catchup_done", function() {
      socket.emit("delta");
    });

    socket.on("delta", function(message) {
      store.appendEvent(message);
    });

    socket.on("reconnect", function() {
      store.resetEvents();
      init();
    });

    init();

    return socket;
  }

  connectToSocket(window.appStore);
})();
