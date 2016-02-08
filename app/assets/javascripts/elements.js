_.templateSettings = {
 evaluate : /\{\[([\s\S]+?)\]\}/g,     // {[ console.log("Hello"); ]} - runs
 interpolate : /\{\{([\s\S]+?)\}\}/g   // {{ key }} - interpolates
};

$(document).ready(function() {
  console.log('running js');
  // add code editor template

  var codeTemplater = _.template( $('#codeTemplate').html() );

  // add template to page and include element id if it exists
  var element_route = window.location.href.match( /elements\/(\d+)$/ );
  // var element_route = [null, '27'];
  console.log('elt route ', element_route);
  if ( element_route !== null ){
    $('body').append( codeTemplater({ element_id: element_route[1] }) );
  } else {
    $('body').append( codeTemplater({ element_id: ""}) );
  }

  // add code editor to template
  // create a new editor and configure it
  // console.log( 'editor', document.getElementsById('code') );
  var editor = CodeMirror(function (editor) {
      console.log('editor', editor);
      $('.code').last().append( editor );
    }, {
      value: '// your code here',
      tabSize: 2,
      lineNumbers: true
  });


  // testing getter and setter and size
  if ( element_route !== null ){
    var elt_id = element_route[1];
    console.log('matches ', element_route);
    codeTemplater({ element_id: elt_id });
    $.getJSON('/elements/' + element_route[1], function (data, responseStatus, jqXHR) {
      editor.setValue(data.content);
    });
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
  $('.code').on('change', 'select', function(event) {
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
  $('.code .save').on('click', function(e) {
    e.preventDefault();
    var $saveButton = $( this );
    $saveButton.prop('disabled', true);
    $saveButton.siblings('.status').text('Saving...');
    //title, :page_id, :content, :link, :pos_x, :pos_y, :width, :height)
    var $codeElement = $( this ).closest('.code');
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

    var methodType, url;
    var elt_id = $('.code').data('id'); // element id that identifies an element in rails
    if ( elt_id ) { // element id exists so update an existing element in rails
      methodType = 'put';
      url = '/elements/' + elt_id;
    } else { // element id doesn't exist so create a new element in rails
      methodType = 'post';
      url = '/elements';
    }

    $.ajax(url, {
      method: methodType,
      dataType: 'json',
      data: code
    }).done(function( response ){
      console.log('saved. codeElement', $codeElement, response.id);
      $codeElement.data('id', response.id);

      $saveButton.siblings('.status').text("Last updated: " + moment().format('h:mm:ss a') );
    }).fail(function(){
      $saveButton.siblings('.status').text("Something went wrong, try again.");
    }).always(function() {
      $saveButton.prop('disabled', false);
    });
  });
});