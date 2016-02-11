# == Schema Information
#
# Table name: pages
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  expiry     :datetime
#  title      :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Page < ActiveRecord::Base
  belongs_to :user
  has_many :elements
end
