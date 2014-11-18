'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.createTable('users', function(table) {
      table.increments();
      table.timestamps();
      table.charset('utf8');
      table.string('name').unique().notNullable();
      table.string('email').unique().notNullable();
      table.text('password_hash', 60).nullable();
    }),

    knex.schema.createTable('records', function(table) {
      table.increments();
      table.timestamps();
      table.charset('utf8');
      table.string('label').notNullable();
      table.text('encrypted_text').nullable();
      table.integer('user_id').references('id').inTable('users');
      table.integer('category_id').references('id').inTable('category');
    }),

    knex.schema.createTable('categories', function(table) {
      table.increments();
      table.timestamps();
      table.charset('utf8');
      table.string('label').notNullable();
      table.integer('lft').notNullable();
      table.integer('rgt').notNullable();
    }),

    knex.schema.createTable('tags', function(table) {
      table.increments();
      table.timestamps();
      table.charset('utf8');
      table.string('label').notNullable().unique();
    }),

    knex.schema.createTable('records_tags', function(table) {
      table.increments();
      table.charset('utf8');
      table.integer('record_id').references('id').inTable('records');
      table.integer('tag_id').references('id').inTable('tag');
    })
    
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('users'),
    knex.schema.dropTable('records'),
    knex.schema.dropTable('categories'),
    knex.schema.dropTable('tags'),
    knex.schema.dropTable('records_tags')
  ]);
};
