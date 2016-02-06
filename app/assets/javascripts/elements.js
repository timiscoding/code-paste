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
      console.log('bounds', boundaries, selection, command, event, this);

    }
  };
  $('#cool-btn').on('click', aloha.ui.command(command));

  var editor = CodeMirror(document.getElementById('code'), {
    value: 'var x = 1',
    tabSize: 2,
    lineNumbers: true
  });
  console.log( 'code contente ', editor.getValue() );
  editor.setValue('var bunnies = 100;');
  editor.setSize(500, 100);

  editor.on('changes', function(instance, changes){
    console.log('editor changed', instance.getWrapperElement().parentNode);
  });

  $('.font-size').on('click', function() {
    var cur_size = parseInt( $('.CodeMirror').css('font-size') );
    if ( $(this).text() === '+' ) {
    console.log('font size inc', cur_size);
      $('.CodeMirror').css('font-size', (cur_size + 2) + 'px');
    } else {
      console.log('dec size');
      $('.CodeMirror').css('font-size', (cur_size - 2) + 'px');
    }

  });

  console.log('modes', CodeMirror.modes, CodeMirror.mimeModes);
  $('#code').on('change', 'select', function(event) {
    console.log('select changed');
    var setting = $(this).attr('id');
    var settingVal = $(this).val();
    if ( setting === 'theme' ) {
      editor.setOption('theme', settingVal );
    } else if ( setting === 'language') {
      editor.setOption('mode', settingVal );
    }
  });
});