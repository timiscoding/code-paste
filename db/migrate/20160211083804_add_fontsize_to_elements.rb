class AddFontsizeToElements < ActiveRecord::Migration
  def change
    add_column :elements, :font_size, :integer
  end
end
