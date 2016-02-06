class CreatePages < ActiveRecord::Migration
  def change
    create_table :pages do |t|
      t.integer :user_id
      t.datetime :expiry
      t.text :title

      t.timestamps null: false
    end
  end
end
