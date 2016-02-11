# == Schema Information
#
# Table name: elements
#
#  id         :integer          not null, primary key
#  title      :text
#  page_id    :integer
#  content    :text
#  link       :text
#  pos_x      :integer
#  pos_y      :integer
#  width      :integer
#  height     :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  font_size  :integer
#  language   :string
#  theme      :string
#

class Element < ActiveRecord::Base
  belongs_to :page
end
