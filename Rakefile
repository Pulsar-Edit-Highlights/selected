desc 'Run package specs'
task :spec do
  puts 'Running package specs...'
  sh 'apm test'
end

desc 'Run ESlint'
task :lint do
  puts 'Running ESlint...'
  sh './node_modules/.bin/eslint lib spec'
end

namespace :travis do
  task :spec do
    # `build-package.sh` installs packages and runs Lint stage.
    sh 'curl -s https://raw.githubusercontent.com/atom/ci/master/build-package.sh | sh'
  end
end

task default: [:spec, :lint]
task travis: ['travis:spec']
