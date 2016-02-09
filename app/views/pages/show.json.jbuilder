json.extract! @page, :id, :user_id, :expiry, :title, :created_at, :updated_at
json.elements @page.elements do |elt|
  json.id elt.id
  json.title elt.title
  json.content elt.content
end