class CreateElements < ActiveRecord::Migration
  def change
    create_table :elements do |t|
      t.text :title
      t.integer :page_id
      t.text :content
      t.text :link
      t.integer :pos_x
      t.integer :pos_y
      t.integer :width
      t.integer :height

      t.timestamps null: false
    end
  end
end
