$(document).ready(function() {
  console.log('running js');
  aloha(document.querySelector('.element .content')); // make elements editable

  // aloha auto assigns an id to the editables
  var editables = aloha.dom.query('.content', document).map(aloha);

  // bind buttons to corresponding editable
  editables.forEach( function( editable ) {
    for ( var command in aloha.ui.commands ) {
      $( '.action-' + command + '-' + editable.id ).on(
          'click',
          aloha.ui.command( editable, aloha.ui.commands[command] ));
    }
  });

  // when the cursor is on a formatted piece of text, change the look of the
  // button to reflect that state
  function middleware(event) {
    $('.active').removeClass('active');
    if ('leave' !== event.type) {
      console.log('target', event);
      var states = aloha.ui.states(aloha.ui.commands, event);
      for (var selector in states) {
        $('.action-' + selector + '-' + event.editable.id)
          .toggleClass('active', states[selector]);
      }
    }
    return event;
  }

  aloha.editor.stack.unshift(middleware);

  var command = {
    crazyCoolProperty: "You selected: ",
    action: function (boundaries, selection, command, event) {
      console.log(command.crazyCoolProperty + aloha.markers.hint(boundaries));
    }
  };
  $('#cool-btn').on('click', aloha.ui.command(command));
});