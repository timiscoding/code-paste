json.extract! @page, :id, :user_id, :expiry, :title, :created_at, :updated_at
# need to sort so that gridster can place the widgets in the right position.
# Placing a widget with a bigger pos_y before a smaller one will cause it to
# snap to the top, with the smaller pos_y widget placed underneath which isn't
# what we want
json.elements @page.elements.order(:pos_y, :pos_x) do |elt|
  json.id elt.id
  json.title elt.title
  json.content elt.content
  json.width elt.width
  json.height elt.height
  json.pos_x elt.pos_x
  json.pos_y elt.pos_y
end