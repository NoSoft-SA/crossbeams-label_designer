#!/usr/bin/env ruby
# frozen_string_literal: true

# Simulate printing on an image to check positioning of variables and barcodes.
#
# Steps:
# 1. Save the background image of a label from the browser.
# 2. Rotate the image if required to test rotated printing:
#    e.g. convert png_example.png -rotate -90 rotated_left.png
# 3. Preview the label and save the generated XML file:
#    e.g. File.open('vars.xml', 'w') { |f| f << doc.to_xml }
# 4. Run this to generate an image with text and rectangles on it:
#    ./preview_lbl_image.rb rotated_left.png vars.xml
# 6. View the results (automatic - the command is included in this script):
#    eog rotated_left_filled.png

require 'nokogiri'

img = ARGV[0]
fn = ARGV[1]
fin_img = img.sub('.png', '_filled.png')

LKP = { 'Arial' => 'arial', 'Times New Roman' => 'times-new-roman', 'Courier New' => 'courier-new' }.freeze

cmd = ["convert #{img}"]
txt = ["-fill '#000000' -stroke none"]
drw = ["-fill none -stroke '#188FA7' -strokewidth 2"]

curr_font = nil
curr_size = nil
doc = Nokogiri::XML(File.read(fn))
doc.xpath('//variable').each do |var| # rubocop:disable Metrics/BlockLength
  sx = var.at_xpath('startx').content.to_i
  sy = var.at_xpath('starty').content.to_i
  w = var.at_xpath('width').content.to_i
  h = var.at_xpath('height').content.to_i
  svar = var.at_xpath('static_value')
  static = svar ? var.content : nil
  barcode = var.at_xpath('barcode').content == 'true'
  rot = var.at_xpath('rotation_angle').content.to_i

  drw << if [90, 270].include?(rot)
           "-draw \"rectangle #{sx},#{sy} #{sx + h},#{sy + w}\""
         else
           "-draw \"rectangle #{sx},#{sy} #{sx + w},#{sy + h}\""
         end

  x = var.at_xpath('baseline_x').content.to_i
  y = var.at_xpath('baseline_y').content.to_i
  size = var.at_xpath('fontsize_px').content.to_i
  font = var.at_xpath('fontfamily').content
  f_no = var.at_xpath('variable_field_count').content
  if font != curr_font
    curr_font = font
    txt << "-font '#{LKP[font]}'"
  end
  if size != curr_size
    curr_size = size
    txt << "-pointsize '#{size}'"
  end
  puts "#{f_no}: #{rot} #{x},#{y}"
  txt << if static.nil?
           if barcode
             "-annotate #{rot}x#{rot}+#{x}+#{y} \"Barcode for #{f_no}\""
           else
             "-annotate #{rot}x#{rot}+#{x}+#{y} \"Text for #{f_no}\""
           end
         else
           "-annotate #{rot}x#{rot}+#{x}+#{y} \"[#{static}] (barcode)\""
         end
end

drw.each { |d| cmd << d }
txt.each { |d| cmd << d }

cmd << fin_img

`#{cmd.join(' ')}`
puts cmd.join("\n")
exec "eog #{fin_img}"
