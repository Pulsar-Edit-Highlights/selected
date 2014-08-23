desc 'Compile all CoffeeScript files'
task :compile do
  puts 'Compiling all CoffeeScript files...'
  sh 'coffee -o tmp -c lib spec'
  puts 'Done.'
end

desc 'Run package specs'
task :spec do
  puts 'Running package specs...'
  sh 'apm test'
end

desc 'Run CoffeeLint'
task :lint do
  puts 'Running CoffeeLint...'
  sh 'coffeelint lib spec'
end

namespace :travis do
  task :prepare do
    sh 'npm install --global coffee-script coffeelint'
  end

  task :spec do
    sh 'curl -s https://raw.githubusercontent.com/atom/ci/master/build-package.sh | sh'
  end
end

task default: [:compile, :spec, :lint]
task travis: ['travis:prepare', :compile, 'travis:spec', :lint]
