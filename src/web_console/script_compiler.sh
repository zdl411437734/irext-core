SOURCE="."
TARGET="$POEM_APPLICATION/irext_console"
MODULE_API="./web/api_doc/js/"

function deploy()
{
  for file in `ls $1`
  do
          echo $file
    if [ -d $1"/"$file ]
    then
      deploy $1"/"$file
    else
      if [ $1"/" = $MODULE_API ]
      then
          echo "compiling file" $1"/"$file
        mkdir -p $TARGET$1
        java -jar compiler.jar --js $1"/"$file --js_output_file $TARGET$1"/"$file
      else
          echo "copying file" $1"/"$file
        mkdir -p $TARGET$1
        cp -v -f $1"/"$file $TARGET$1"/"$file
      fi
    fi
  done
}

INIT_PATH="./"
#rm -rf $TARGET
deploy $INIT_PATH
mv $TARGET$INIT_PATH $TARGET
#cp $SOURCE"/"run.sh $TARGET
