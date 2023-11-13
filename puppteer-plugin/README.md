# centos 安装chrome 
> wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm

> yum install ./google-chrome-stable_current_x86_64.rpm

安装完之后chrome位置大概在  **/opt/google/chrome/chrome**

# centos 中 chrome乱码问题
>  yum -y groupinstall "X Window System"

>  yum -y groupinstall chinese-support

>  yum -y groupinstall Fonts