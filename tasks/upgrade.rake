namespace :label_designer do
  desc 'Upgrade the label designer javascript'
  task :upgrade do
    reldir = ENV.fetch('JSDIR', 'js')
    final_dir = File.join(Dir.pwd, 'public', reldir)
    raise "Directory does not exist: #{final_dir}" unless File.exist?(final_dir)

    from = File.expand_path('../lib/crossbeams/label_designer/assets/javascripts/crossbeams-label-designer.js', __dir__)
    FileUtils.cp(from, File.join(final_dir, 'crossbeams-label-designer.js'))
    puts "Upgraded #{File.join(final_dir, 'crossbeams-label-designer.js')}"
  end
end
