const utils = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.youtube || !config.youtube.key) {
        throw 'Youtube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }
    const username = ctx.params.username;
    const embed = !ctx.params.embed;

    const playlistId = (await utils.getChannelWithUsername(username, 'contentDetails', ctx.cache)).data.items[0].contentDetails.relatedPlaylists.uploads;

    const data = (await utils.getPlaylistItems(playlistId, 'snippet,contentDetails')).data.items;

    ctx.state.data = {
        title: `${username}`,
        link: `https://www.youtube.com/user/${username}`,
        description: `${username}`,
        item: data
            .filter((d) => d.snippet.title !== 'Private video' && d.snippet.title !== 'Deleted video')
            .map((item) => {
                const snippet = item.snippet;
                const videoId = snippet.resourceId.videoId;
                const img = utils.getThumbnail(snippet.thumbnails);
                return {
                    title: snippet.title,
                    description: `${
                        embed ? '<iframe id="ytplayer" type="text/html" width="640" height="360" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>' : ''
                    }${utils.formatDescription(snippet.description)}<img src="${img.url}">`,
                    pubDate: new Date(snippet.publishedAt).toUTCString(),
                    link: `https://www.youtube.com/watch?v=${videoId}`,
                };
            }),
    };
};
