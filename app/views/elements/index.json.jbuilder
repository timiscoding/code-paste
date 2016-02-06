json.array!(@elements) do |element|
  json.extract! element, :id, :title, :page_id, :content, :link, :pos_x, :pos_y, :width, :height
  json.url element_url(element, format: :json)
end
