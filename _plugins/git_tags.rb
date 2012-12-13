# A Jekyll Liquid tag to print the latest commit SHA and date
# SHA usage: {% git_sha length %}
# Date usage: {% git_date format %}

require 'git'
 
module Jekyll
  class GitSHA < Liquid::Tag
 
    def initialize(tag_name, text, tokens)
      super
      @length = text.to_i
      if @length < 1
        @length = 10
      end
    end
 
    def render(context)
      "#{Git.open(Dir.getwd).log.first.sha.slice(0,@length)}"
    end
  end

  class GitDate < Liquid::Tag
 
    def initialize(tag_name, text, tokens)
      super
      @format = text
      if @format == ""
        @format = "%e %B %Y"
      end
    end
 
    def render(context)
      "#{Git.open(Dir.getwd).log.first.date.strftime(@format)}"
    end
  end
end
 
Liquid::Template.register_tag('git_sha', Jekyll::GitSHA)
Liquid::Template.register_tag('git_date', Jekyll::GitDate)
