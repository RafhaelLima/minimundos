<?php

return "
<config>
	<user>
		<id>12345678</id>
		<justRegistered>N</justRegistered>
		<isNew>N</isNew>
		<isVIP>Y</isVIP>
	</user>
	<space>
		<id>99999999999999999999999999999999</id>
		<name>Casa+Inicial</name>
		<modelId>2000</modelId>
		<snapshotFile>".MEDIA_URI."19/19_4JRVqPpy5IarwdT9RyUc.jpg</snapshotFile>
	</space>
	<webServiceManager>
		<dataService>
			<url>".GATEWAY_URI."</url>
			<serviceName>ds</serviceName>
			<sessionProperty>jsessionid</sessionProperty>
			<timeout>5000</timeout>
			<enableSecureCalls>false</enableSecureCalls>
		</dataService>
		<messageService>
			<timeout>5000</timeout>
		</messageService>
	</webServiceManager>
	<misc>
		<singleBrowserOnly>false</singleBrowserOnly>
		<loadContentFromPackages>true</loadContentFromPackages>
	</misc>
	<paths>
		<webDomain>".SITE_DOMAIN."</webDomain>
		<rootPath>".rtrim(SITE_URI, "/")."</rootPath>
		<consolePath>".SITE_URI."profile/</consolePath>
		<storePath>".SITE_URI."store/</storePath>
		<newsPath>".SITE_URI."news/</newsPath>
		<forumPath>".SITE_URI."forum/</forumPath>
		<helpPath>".SITE_URI."help/</helpPath>
		<supportPath>".SITE_URI."support/</supportPath>
		<settingsPath>".SITE_URI."settings/</settingsPath>
		<getTokensPath>".SITE_URI."store/</getTokensPath>
		<citizenLevelInfoPath>".SITE_URI."help/faq/citizen-levels/</citizenLevelInfoPath>
		<skillsInfoPath>".SITE_URI."help/faq/levels-xp/</skillsInfoPath>
		<attributesInfoPath>".SITE_URI."help/faq/avatar-attributes/</attributesInfoPath>
		<clientPath>".CONTENT_CONTENT."main.swf</clientPath>
		<contentPath>".CONTENT_CONTENT."</contentPath>
		<packagePath>".CONTENT_CONTENT."packages/</packagePath>
		<libraryPath>".CONTENT_CONTENT."assets/</libraryPath>
		<configPath>".SITE_URI."config/</configPath>
		<mediaPath>".MEDIA_URI."</mediaPath>
		<themePath>".CONTENT_CONTENT."themes/</themePath>
		<avatarImagesPath>".AVATARS_URI."</avatarImagesPath>
		<spaceImagesPath>".CONTENT_CONTENT."images/space/</spaceImagesPath>
		<widgetImagesPath>".WIDGETS_URI."</widgetImagesPath>
		<homespacePath>".SITE_URI."home/</homespacePath>
		<petTrainingPath>".SITE_URI."space/pettraining/</petTrainingPath>
		<plantNurseryPath>".SITE_URI."space/gardenlife/</plantNurseryPath>
		<tradingPostPath>".SITE_URI."space/tradingpost/</tradingPostPath>
		<buySellForumPath>".SITE_URI."forum/forums/66-Buy-amp-Sell</buySellForumPath>
	</paths>
</config>
";
