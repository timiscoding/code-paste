json.array!(@pages) do |page|
  json.extract! page, :id, :user_id, :expiry, :title
  json.url page_url(page, format: :json)
end
