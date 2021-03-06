
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import clazz from 'classname';
import moment from 'moment';
import injectSheet from 'react-jss';

import classes from './classes';
import helper from 'utils/helper';
import ProgressImage from 'ui/ProgressImage';
import Loader from 'ui/Loader';
import Hero from 'components/Hero';

@inject(stores => ({
    close: () => stores.comments.toggle(false),
    loading: stores.comments.loading,
    hotList: stores.comments.hotList,
    newestList: stores.comments.newestList,
    thumbsup: stores.comments.like,
    getList: () => stores.comments.getList(Object.assign({}, stores.controller.song)),
    loadmore: stores.comments.loadmore,
    song: stores.comments.song,
}))
@observer
class Comments extends Component {
    componentWillMount() {
        this.props.getList();
    }

    async loadmore(e) {
        var container = this.refs.list;

        // Drop the duplicate invoke
        if (container.classList.contains(classes.loadmore)) {
            return;
        }

        if (container.scrollTop + container.offsetHeight + 100 > container.scrollHeight) {
            // Mark as loading
            container.classList.add(classes.loadmore);

            await this.props.loadmore();
            container.classList.remove(classes.loadmore);
        }
    }

    renderNestest(list) {
        var { classes, close } = this.props;

        if (!list.length) {
            return false;
        }

        return (
            <ul className={classes.nestest}>
                {
                    list.map((e, index) => {
                        return (
                            <li key={index}>
                                <Link
                                    onClick={close}
                                    to={`/user/${e.user.userId}`}>
                                    {e.user.nickname}
                                </Link>
                                ：

                                <span>
                                    {e.content}
                                </span>
                            </li>
                        );
                    })
                }
            </ul>
        );
    }

    renderComment(key, item) {
        var { classes, thumbsup, close } = this.props;

        return (
            <div
                className={classes.comment}
                key={key}>
                <Link
                    className="tooltip"
                    data-text={item.user.nickname}
                    onClick={close}
                    to={`/user/${item.user.userId}`}>
                    <ProgressImage {...{
                        height: 48,
                        width: 48,
                        src: item.user.avatarUrl,
                    }} />
                </Link>

                <aside>
                    <p>{item.content}</p>

                    <div className={classes.meta}>
                        <span
                            className={clazz('tooltip', classes.thumbsup, {
                                [classes.liked]: item.liked,
                            })}
                            data-text={`${helper.humanNumber(item.likedCount)} liked`}
                            onClick={ev => thumbsup(item.commentId, !item.liked)}>
                            <i className="ion-thumbsup" />
                        </span>

                        {moment(item.time).endOf('day').fromNow()}
                    </div>
                    {
                        this.renderNestest(item.beReplied)
                    }
                </aside>
            </div>
        );
    }

    renderHotList() {
        return this.props.hotList.map((e, index) => {
            return this.renderComment(index, e);
        });
    }

    renderNewestList() {
        return this.props.newestList.map((e, index) => {
            return this.renderComment(index, e);
        });
    }

    render() {
        var { classes, loading, song, close } = this.props;

        if (loading || !song.id) {
            return <Loader show={true} />;
        }

        return (
            <div className={classes.container}>
                <img
                    alt="Close"
                    className={classes.close}
                    onClick={close}
                    src="assets/close.png" />

                <Hero close={close} />

                <aside
                    className={classes.list}
                    onScroll={e => this.loadmore()}
                    ref="list">
                    <div className={classes.scroller}>
                        <div className={classes.hotList}>
                            <h3>Hot Comments</h3>
                            {this.renderHotList()}
                        </div>

                        <div className={classes.newestList}>
                            <h3>Newest Comments</h3>
                            {this.renderNewestList()}
                        </div>
                    </div>
                </aside>
            </div>
        );
    }
}

export default injectSheet(classes)(Comments);
