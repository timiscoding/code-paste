var app = app || {};
app.editors = {}; // key = generateEditorId(), value = CodeMirror instance
app.editor_id = 0;
app.expiries = [ "Change expiry", "Never", "1 minute", "10 minutes", "1 hour", "1 day", "1 week" ];
app.gridster_base_width = 160;
app.gridster_base_height = app.gridster_base_width;

_.templateSettings = {
 evaluate : /\{\[([\s\S]+?)\]\}/g,     // {[ console.log("Hello"); ]} - runs
 interpolate : /\{\{([\s\S]+?)\}\}/g   // {{ key }} - interpolates
};

var createUIElement = function(element) {
  var templateArgs;
  console.log('createUIElement ', element);
  if (typeof element.id === 'number') {
    templateArgs = {
      element_id: element.id,
      element_title: element.title
    };
  }

  console.log('create code elt with elt id ', element.id, 'width: ', element.width, 'height ', element.height, 'x ', element.pos_x, 'y ', element.pos_y);
  var $codeElement = $( app.codeTemplater( templateArgs ) );
  // preset the language & theme to what the user last selected
  $codeElement.find('#theme').val(element.theme);
  $codeElement.find('#language').val(element.language);

  // add another widget
  app.gridster.add_widget( $('<div>').addClass('widget').append( $codeElement ), element.width || 3, element.height || 1, element.pos_x, element.pos_y);
  // $('body').append( $codeElement );

  // create a new editor and configure it
  var editor = CodeMirror(function (editor) {
      console.log('editor', editor);
      $codeElement.append( editor ); // add code editor to template
    }, {
      value: '// your code here',
      tabSize: 2,
      lineNumbers: true,
      theme: element.theme || '',
      mode: element.language || ''
  });
  editor.setSize('100%', '100%');

  // preset font size to what the user last selected
  if (element.font_size) {
    $codeElement.find('.CodeMirror').css('font-size', element.font_size + 'px');
  }

  // bind event handler to editor
  CodeMirror.on(editor, 'changes', function(editor) {
    console.log('editor updated ');
    var codeElement = $( editor.getWrapperElement() ).parent('.code');
    // console.log('codeElement ', codeElement.html());

    throttledCreateUpdateElement( codeElement );
  });
  var new_editor_id = generateEditorId();
  $codeElement.data('editor-id', new_editor_id);
  app.editors[new_editor_id] = editor;
  return $codeElement;
};

var generateEditorId = function() {
  return app.editor_id++;
}

var createElement = function () {
    var url = '/elements';
    var code = {
      element: {
        page_id: getPageID(),
      }
    };

    $.ajax(url, {
      method: 'post',
      dataType: 'json',
      data: code
    }).done(function( element ){
      console.log('created blank element with id', element.id);
      createUIElement( element );
    }).fail(function(){
      $('#page-status').text("Something went wrong, try again.");
    })
};

var createUpdateElement = function (element) {
  console.log('key up in ', this );

    var $codeElement = $( element );
    var url = '/elements';
    var editor_id = $codeElement.data('editor-id');
    var code = {
      element: {
        title: $codeElement.find('.element-title').val(),
        page_id: getPageID(),
        content: app.editors[editor_id].getValue(),
      }
    };
    var methodType, url;
    var elt_id = $codeElement.data('element-id'); // element id that identifies an element in rails
    console.log('updating element with content: ', code);
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
      $codeElement.data('element-id', response.id);
      $('#page-status').text("Last auto saved: " + moment().format('h:mm:ss a') );
    }).fail(function(){
      $('#page-status').text("Couldn't auto save code snippet. Try again" );
    });
};
var throttledCreateUpdateElement = _.throttle( createUpdateElement, 5000 );

var deleteElement = function() {
  console.log('delete element', this);
  var $codeElement = $( this ).closest('.code');
  var $widget = $codeElement.parent('div');
  var editor_id = $codeElement.data('editor-id');
  var elt_id = $codeElement.data('element-id');
  var url = '/elements/' + elt_id;
  if (elt_id){ // element id exists so destroy element in rails
    $.ajax(url, {
      method: 'delete',
      dataType: 'json'
    }).done(function() {
      console.log('element destroyed. editor_id ', editor_id);
      // $codeElement.remove();
      delete app.editors[editor_id];
      app.gridster.remove_widget( $widget );
    }).fail(function() {
      $codeElement.find('.status').text('Something went wrong. Try again');
    });
  } else { // element doesn't exist on server so just remove the gui element
    // $codeElement.remove();
    delete app.editors[editor_id];
    app.gridster.remove_widget( $widget );
  }
};

var changeLanguageOrTheme = function(event) {
  var settings = {};
  console.log('select changed');
  var $codeElement = $( this ).closest('.code');
  var elt_id = $codeElement.data('element-id');
  var editor_id = $codeElement.data('editor-id');
  var setting = $(this).attr('id');
  var settingVal = $(this).val();
  if ( setting === 'theme' ) {
    app.editors[editor_id].setOption('theme', settingVal );
    settings['theme'] = settingVal;
  } else if ( setting === 'language') {
    app.editors[editor_id].setOption('mode', settingVal );
    settings['language'] = settingVal;
  }
  updateElementSettings(elt_id, settings);
};

var changeFontSize = function() {
  var $codeElement = $( this ).closest('.code');
  var elt_id = $codeElement.data('element-id');
  var editor_id = $codeElement.data('editor-id');
  var cur_size = parseInt( $codeElement.find('.CodeMirror').css('font-size') );
  var new_size;
  if ( $(this).hasClass('inc') ) {
  console.log('font size ', cur_size);
    new_size = cur_size + 2;
    $codeElement.find('.CodeMirror').css('font-size', new_size + 'px');
  } else {
    console.log('dec size');
    new_size = cur_size - 2;
    $codeElement.find('.CodeMirror').css('font-size', new_size + 'px');
  }
  app.editors[editor_id].refresh(); // update editor so cursor aligns with font resizing
  throttledUpdateElementSettings(elt_id, { font_size: new_size });
};

var updateElementSettings = function(element_id, settings) {
  $.ajax('/elements/' + element_id, {
    method: 'put',
    dataType: 'json',
    data: {
      element: settings
    }
  });
};
var throttledUpdateElementSettings = _.throttle(updateElementSettings, 5000);

var updateExpiry = function() {
  var selected = $( this ).find('option:selected').text();
  console.log('expiry selected ', selected );
  console.log('expiry time changed to ', app.expiries[selected]);
  var expiry_time;
  switch(selected){
    case "Never":
      console.log('set expiry to nil');
      expiry_time = "";
      break;
    case "1 minute":
      expiry_time = moment().add(1, 'minutes').format();
      break;
    case "10 minutes":
      expiry_time = moment().add(10, 'minutes').format();
      break;
    case "1 hour":
      expiry_time = moment().add(1, 'hours').format();
      break;
    case "1 day":
      expiry_time = moment().add(1, 'days').format();
      break;
    case "1 week":
      expiry_time = moment().add(1, 'weeks').format();
      break;
    default: // 'Change expiry'
      return;
  }

  $.ajax('/pages/' + getPageID(), {
    method: 'put',
    dataType: 'json',
    data: {
      page: {
        expiry: expiry_time
      }
    }
  }).done(function() {
    $('#expiry-status').text('Page expires: ' + addExpiryCountdown(expiry_time) );
  }).fail(function() {
    $('#expiry-status').remove(); // countdown is auto removed too
    $('<span>').attr('id', 'expiry-status').text('Something went wrong. Try again').insertAfter('#expiry');
  });
};

var timeFromNow = function(expiry_time) {
  var expiry;
  if ( expiry_time ) {
    expiry = moment( expiry_time ).fromNow();
  } else {
    expiry = 'never';
  }
  return expiry;
};

var addExpiryCountdown = function(expiry_time) {
  if ( expiry_time ) {
    $("#expiry-status")
      .countdown(moment(expiry_time).toDate(), function(event) {
        var ftime = "Page expires:";
        if ( !!event.offset.totalDays ) { ftime += " %-D day%!D"; }
        if ( !!event.offset.hours ) { ftime += " %-H hr%!H"}
        ftime += " %-M min %-S sec";
        // if ( !!event.offset.minutes ) { ftime += " %M min"}
        // if ( !!event.offset.seconds ) { ftime += " %S sec"}
        $(this).text( event.strftime(ftime) );
    }).on('finish.countdown', function(event) {
      $(this).text('Page expired!');
    });
  } else {
      $('#expiry-status').remove(); // countdown is auto removed too
      $('<span>').attr('id', 'expiry-status').text('Page expires: never').insertAfter('#expiry');
  }
};

var getPageID = function() {
  var path_match = location.href.match( /pages\/(\d+)$/ );
  return path_match[1];
};

var updateWidgetParams = function($widget) {
  var widget_params = app.gridster.serialize($widget)[0];
  console.log('widget params', widget_params);
  var elt_id = $widget.find('.code').data('element-id');
  $.ajax('/elements/' + elt_id, {
    dataType: 'json',
    method: 'put',
    data: {
      element: widget_params
    }
  }).done(function(){
    $('#page-status').text('Widget resize/position saved');
  }).fail(function(){
    $('#page-status').text('Widget resize/position failed to save. Try again');
  });
};

$(document).ready(function() {
  console.log('running js');

  // set up gridster and store it as a global instance
  app.gridster = $(".gridster").gridster({
      widget_selector: 'div',
      widget_margins: [2, 2],
      widget_base_dimensions: [app.gridster_base_width, app.gridster_base_height],
      draggable: {
        handle: '.widget',
        stop: function(event, ui) {
          $widget = $(event.target);
          var widget_params = app.gridster.serialize($widget)[0];
          console.log('dragging stopped ', $widget, widget_params);
          updateWidgetParams( $widget );
        }
      },
      resize: {
        enabled: true,
        min_size: [3, 1],
        stop: function(e, ui, $widget) {
          console.log('e', e);
          console.log('ui', ui);
          console.log('$widget', $widget);
          // debugger
          // refreshes the editor so the gutter flows all the way down the editor
          app.editors[ $widget.find('.code').data('editor-id') ].refresh();

          updateWidgetParams( $widget );
        }
      },
      serialize_params: function ($w, wgd) {
        // console.log('grid widget, ', $w.text());
        return {
          pos_x: wgd.col,
          pos_y: wgd.row,
          width: wgd.size_x,
          height: wgd.size_y
        };
      }
  }).data('gridster');

  // remove widget
  // gridster.remove_widget( $('.gridster div').eq(3) );

  var gridArr = app.gridster.serialize();
  console.log('grid array', gridArr);

  // populate expiry select input
  console.log('expiry ' + JSON.stringify(app.expiries) );
  app.expiries.forEach( function( label ){
    $('select#expiry').append( $('<option>').text(label) );
  });

  //update expiry time when user changes select input
  $('select#expiry').on('change', updateExpiry);

  // get code element template
  app.codeTemplater = _.template( $('#codeTemplate').html() );

  // get all elements for this page
  $.getJSON('/pages/' + getPageID()).done( function (data) {
    console.log('data for page');
    addExpiryCountdown(data.expiry);
    data.elements.forEach( function(elt) {
      console.log(elt.title, elt.content);
      var $codeElement = createUIElement(elt);

      $.getJSON('/elements/' + elt.id).done( function (data) {
        var editor_id = $codeElement.data('editor-id');
        if (elt.content) {
          app.editors[editor_id].setValue(elt.content);
        }
        // debugger
        // $codeElement.parent('div').data('sizey') * app.grid_base_size
        app.editors[editor_id].setSize('100%', '100%');
      });
    });
  });


  $('.add-code').on('click', createElement);

  // when a font size button is pressed, increase/decrease font size
  $('body').on('click', '.code .font-size', changeFontSize);

  // when a theme or language is selected, update the editor
  console.log('modes', CodeMirror.modes, CodeMirror.mimeModes);
  $('body').on('change', '.code select', changeLanguageOrTheme);

  $('body').on('click', '.code .delete', deleteElement);

  // attempt to save all elements before tab closes. this is to safeguard
  // against the situation when you type something and close the tab before
  // autosave kicks in 5s later.
  // doesn't guarantee it gets saved as the ajax call could still fail for
  // element update. not enough time to fix this yet
  $(window).on('beforeunload', function(){
    console.log('see yaaaaa');
    $('.code').each( function(index, codeElement) {
      console.log('code elt ', codeElement);
      // $codeElement.data('')
      createUpdateElement(codeElement);
    });
    // return "Do you really want to close?";
  });

  $('#page-title').on('blur', function() {
    var page_title = $( this ).val();
    console.log('Save title ', page_title);
    $.ajax('/pages/' + getPageID(), {
      method: 'put',
      dataType: 'json',
      data: {
        page: {
          title: page_title
        }
      }
    }).done(function() {
      $('#page-status').text('Page title updated');
    }).fail(function() {
      $('#page-status').text("Page title not updated on server. Try again");

    });
  });
});