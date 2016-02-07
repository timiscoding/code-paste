$(document).ready(function() {
  console.log('running js');

  // create a new editor and configure it
  var editor = CodeMirror(document.getElementById('code'), {
    value: 'var x = 1',
    tabSize: 2,
    lineNumbers: true
  });

  // testing getter and setter and size
  if ( typeof app !== 'undefined' && typeof app.content !== 'undefined') {
    console.log( 'code contente ', app.content );
    editor.setValue(app.content);
  }
  // editor.setSize(500, 100);

  // when user types in editor, fire event
  editor.on('changes', function(instance, changes){
    console.log('editor changed', instance.getWrapperElement().parentNode);
  });

  // when a font size button is pressed, increase/decrease font size
  $('.font-size').on('click', function(e) {
    e.preventDefault();
    var cur_size = parseInt( $('.CodeMirror').css('font-size') );
    if ( $(this).text() === '+' ) {
    console.log('font size inc', cur_size);
      $('.CodeMirror').css('font-size', (cur_size + 2) + 'px');
    } else {
      console.log('dec size');
      $('.CodeMirror').css('font-size', (cur_size - 2) + 'px');
    }
  });

  // when a theme or language is selected, update the editor
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

  // send an AJAX POST request to create a new element
  $('#code .save').on('click', function(e) {
    e.preventDefault();
    //title, :page_id, :content, :link, :pos_x, :pos_y, :width, :height)
    var $codeElement = $( this ).closest('#code');
    var url = '/elements';
    var code = {
      element: {
        title: 'new element',
        page_id: 100,
        content: editor.getValue(),
        link: 'www.google.com',
        pos_x: 1,
        pos_y: 2,
        width: 500,
        height: 100
      }
    };
    // console.log(['save this', url, '|', JSON.stringify(code, null, 4), '|'].join(' '));
    $.ajax('/elements', {
      method: 'post',
      dataType: 'json',
      data: code
    }).done(function( response ){
      console.log('saved', response);
      $codeElement.data('id', response.id);
    });
  });
});