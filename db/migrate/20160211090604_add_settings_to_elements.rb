class AddSettingsToElements < ActiveRecord::Migration
  def change
    add_column :elements, :language, :string
    add_column :elements, :theme, :string
  end
end
