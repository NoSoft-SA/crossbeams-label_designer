module Crossbeams
  module LabelDesigner
    class Page
      def initialize(file_to_load=nil)
        # set up config here for url paths etc.
        @file_to_load = file_to_load || 'new'
      end

      def render
        <<-EOS.freeze
        <h1>An embedded area</h1>
        <p>This tests the loading of a few"pages"</p>
        <p>To test, pass one of the following values for the file to load:
        <ul>
        <li>leave blank - simulates loading a new canvas</li>
        <li><em>blue</em> - simulates loading file 1</li>
        <li><em>green</em> - simulates loading file 2</li>
        </ul>
        <div id="workspace">
          <span class="#{@file_to_load}">Loaded file: <strong>#{@file_to_load}</strong></span>
        </div>
        EOS
      end

      def javascript
        <<-EOS.freeze
        <script type="text/javascript">
          var theBox = document.getElementById('workspace');
          theBox.addEventListener('click', function (event) {
            alert('I was clicked');
          })
        </script>
        EOS
      end

      def css
        <<-EOS.freeze
        <style>
        #workspace {
          padding: 40px;
          border: thin solid #999;
        }
        .new {
          color:black;
        }
        .blue {
          color: blue;
        }
        .green {
          color: green;
        }
        </style>
        EOS
      end
    end
  end
end
